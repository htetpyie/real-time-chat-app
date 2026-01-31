using ChatApp.Database.AppDbContextModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace ChatApp.Server.Hubs;

[Authorize]
public class ChatHub: Hub
{
    private readonly AppDbContext _dbContext;
    private readonly IRoleService _roleService;
    private static readonly ConcurrentDictionary<string, string> _userConnections = new();
    private static readonly ConcurrentDictionary<string, bool> _onlineUsers = new();

    public ChatHub(AppDbContext dbContext, IRoleService roleService)
    {
        _dbContext = dbContext;
        _roleService = roleService;
    }

    public override async Task OnConnectedAsync()   
    {
        var userId = Context.UserIdentifier;
        var userName = Context.User?.FindFirst(ConstantClaimCode.UserName)?.Value ?? "Unknown";
        var roleId = Context.User?.FindFirst(ConstantClaimCode.RoleId)?.Value ?? "user";

        if (!string.IsNullOrEmpty(userId))
        {
            _userConnections[userId] = Context.ConnectionId;
            _onlineUsers[userId] = true;

            await Clients.Others.SendAsync("UserConnected", userId);

            // If admin connected, notify them of all online users
            var isAdmin = await _roleService.IsAdminRoleAsync(roleId);
            if (isAdmin)
            {
                var onlineUsersList = _onlineUsers.Keys.ToList();
                await Clients.Caller.SendAsync("OnlineUsersList", onlineUsersList);
            }

            Console.WriteLine($"User connected: {userName} ({userId}) - Role: {roleId}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;

        if (!string.IsNullOrEmpty(userId))
        {
            _userConnections.TryRemove(userId, out _);
            _onlineUsers.TryRemove(userId, out _);

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

        // Validate: Users can only send to admin
        var isAdmin = await _roleService.IsAdminRoleAsync(senderRoleId);
        var adminUserId = await _roleService.GetAdminUserId();

        // Create message object
        var message = new MessageRequest
        {
            Message = request.Message,
            SenderId = senderId,
            RecipientId = isAdmin ? request.RecipientId : adminUserId,
            SentDate = DateTime.UtcNow,
            IsRead = false
        };

        if (_userConnections.TryGetValue(request.RecipientId, out var recipientConnectionId))
        {
            await Clients.Client(recipientConnectionId)
                .SendAsync("ReceiveMessage", message);
        }

        await Clients.Caller.SendAsync("ReceiveMessage", message);

        var chat = new Chat
        {
            SenderId = senderId,
            RecipientId = request.RecipientId,
            Message = request.Message,
            SentDate = DateTime.UtcNow.ToMyanmarDateTime(),
        };

        await _dbContext.Chats.AddAsync(chat);
        await _dbContext.SaveChangesAsync();
    }

    public async Task GetOnlineUsers()
    {
        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "admin")
        {
            throw new HubException("Only admins can view online users");
        }

        var users = _onlineUsers.Keys.ToList();
        await Clients.Caller.SendAsync("OnlineUsersList", users);
    }

    //public async Task SendMessage(string receiverId, string message)
    //{
    //    try
    //    {
    //        var userId = Context.UserIdentifier;
    //        if (string.IsNullOrEmpty(userId)) return;

    //        var chat = new Chat
    //        {
    //            SenderId = userId,
    //            RecipientId = receiverId,
    //            Message = message,
    //            SentDate = DateTime.UtcNow.ToMyanmarDateTime(),
    //        };

    //        await _dbContext.Chats.AddAsync(chat);
    //        await _dbContext.SaveChangesAsync();

    //        await Clients.User(receiverId).SendAsync("ReceiveMessage", new
    //        {
    //            responseCode = 200,
    //            message = "Message sent",
    //            data = message,
    //            isSuccess = true
    //        });
    //    }
    //    catch (Exception)
    //    {
    //        throw;
    //    }
    //}

    public class SendMessageRequest
    {
        public string RecipientId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class MessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public string SenderId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string RecipientId { get; set; } = string.Empty;
        public DateTime SentDate { get; set; }
        public string SentDateString => DateTime
            .UtcNow
            .ToMyanmarDateTime()
            .ToDateTimeString();
        public bool IsRead { get; set; }
    }

}
