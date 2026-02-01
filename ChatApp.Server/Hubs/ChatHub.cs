using ChatApp.Database.AppDbContextModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Design.Internal;
using Shared.Models;
using System.Collections.Concurrent;
using System.Data;
using System.Security.Claims;

namespace ChatApp.Server.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _dbContext;
    private readonly IRoleService _roleService;
    private static readonly ConcurrentDictionary<string, string> _userConnections = new();
    private static readonly ConcurrentDictionary<string, UserPresenceInfo> _onlineUsers = new();

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
            _onlineUsers[userId] = new UserPresenceInfo
            {
                Username = userName,
                Role = roleId,
                ConnectedAt = DateTime.UtcNow
            };

            await Clients.Others.SendAsync("UserConnected", userId);
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
        var message = new MessageModel
        {
            Id = Guid.NewGuid().ToString(),
            Message = request.Message,
            SenderId = senderId,
            RecipientId = isAdmin ? request.RecipientId : adminUserId,
            SentDate = DateTime.UtcNow,
            IsRead = false
        };

        if (_userConnections.TryGetValue(message.RecipientId, out var recipientConnectionId))
        {
            await Clients.Users(message.RecipientId)
                .SendAsync("ReceiveMessage", message);
        }

        await Clients.Caller.SendAsync("ReceiveMessage", message);

        var chat = new Chat
        {
            SenderId = senderId,
            ChatId = message.Id,
            RecipientId = message.RecipientId,
            Message = request.Message,
            SentDate = message.SentDate,
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
        public DateTime? SentDate { get; set; }
        public string SentDateString => DateTime
            .UtcNow
            .ToMyanmarDateTime()
            .ToDateTimeString();
        public bool IsRead { get; set; }
    }

}
