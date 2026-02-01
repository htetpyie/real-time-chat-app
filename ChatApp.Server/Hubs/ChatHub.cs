using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Server.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _dbContext;
    private readonly IRoleService _roleService;
    private readonly IUserPresenceService _presenceService;

    public ChatHub(AppDbContext dbContext, 
        IRoleService roleService, 
        IUserPresenceService presenceService)
    {
        _dbContext = dbContext;
        _roleService = roleService;
        _presenceService = presenceService;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        var userName = Context.User?.FindFirst(ConstantClaimCode.UserName)?.Value ?? "Unknown";
        var roleId = Context.User?.FindFirst(ConstantClaimCode.RoleId)?.Value ?? "user";

        if (!string.IsNullOrEmpty(userId))
        {
            _presenceService.UserConnected(userId, Context.ConnectionId);
            await Clients.Others.SendAsync("UserConnected", userId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;

        if (!string.IsNullOrEmpty(userId))
        {
            _presenceService.UserDisconnected(userId);

            await Clients.Others.SendAsync("UserDisconnected", userId);
            Console.WriteLine($"User disconnected: {userId}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(SendMessageRequest request)
    {
        var senderId = Context.UserIdentifier;
        var senderName = Context.User?.FindFirst(ConstantClaimCode.UserName)?.Value ?? "Unknown";
        var senderRoleId = Context.User?.FindFirst(ConstantClaimCode.RoleId)?.Value ?? "user";

        if (string.IsNullOrEmpty(senderId))
        {
            throw new HubException("User not authenticated");
        }

        var isAdmin = await _roleService.IsAdminRoleAsync(senderRoleId);
        var adminUserId = await _roleService.GetAdminUserId();

        var message = new MessageModel
        {
            Id = Guid.NewGuid().ToString(),
            Message = request.Message,
            SenderName = senderName,
            SenderId = senderId,
            RecipientId = isAdmin ? request.RecipientId : adminUserId,
            SentDate = DateTime.UtcNow.ToMyanmarDateTime(),
            IsRead = false
        };

        if (_presenceService.GetOnlineUsers().Contains(message.RecipientId))
        {
            await Clients.Users(message.RecipientId)
                .SendAsync("ReceiveMessage", message);
            message.IsRead = true;
        }

        await Clients.Caller.SendAsync("ReceiveMessage", message);

        var chat = new Chat
        {
            SenderId = senderId,
            ChatId = message.Id,
            RecipientId = message.RecipientId,
            Message = request.Message,
            SentDate = message.SentDate,
            IsRead = message.IsRead,
        };

        await _dbContext.Chats.AddAsync(chat);
        await _dbContext.SaveChangesAsync();
    }

    public async Task GetOnlineUsers()
    {
        var roleId = Context.User?.FindFirst(ConstantClaimCode.RoleId)?.Value;

        var isAdmin = await _roleService.IsAdminRoleAsync(roleId ?? "");

        if (!isAdmin)
        {
            throw new HubException("Only admins can view online users");
        }

        var users = _presenceService.GetOnlineUsers();
        await Clients.Caller.SendAsync("OnlineUsersList", users);
    }

    private class UserPresenceInfo
    {
        public string Username { get; set; }
        public string Role { get; set; }
        public DateTime ConnectedAt { get; set; }
    }

    public class SendMessageRequest
    {
        public string RecipientId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class MessageModel
    {
        public string Id { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string SenderId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string RecipientId { get; set; } = string.Empty;
        public DateTime? SentDate { get; set; } = DateTime.UtcNow.ToMyanmarDateTime();
        public string SentDateString => SentDate
            .ToDateTimeString();    
        public string SentTimeAgo => SentDate
            .TimeAgo();
        public bool IsRead { get; set; }
    }

}
