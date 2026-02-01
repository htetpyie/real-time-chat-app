using ChatApp.Server.Features.TokenFeature;
using ChatApp.Server.Features.UserFeature;
using ChatApp.Server.Hubs;
using Microsoft.EntityFrameworkCore;
using Shared.Models;
using System.Collections.Concurrent;
using static ChatApp.Server.Hubs.ChatHub;
namespace ChatApp.Server.Features.ChatFeature;

public class ChatService : IChatService
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IUserPresenceService _presenceService;
    private readonly IRoleService _roleService;

    public ChatService(AppDbContext context,
        ITokenService tokenService,
        IRoleService roleService,
        IUserPresenceService presenceService)
    {
        _context = context;
        _tokenService = tokenService;
        _roleService = roleService;
        _presenceService = presenceService;
    }

    public async Task<ResponseModel<List<ChatUserModel>>> GetChatUserList()
    {
        try
        {
            var adminId = await _roleService.GetAdminUserId();

            var userIds = await _context.Chats
                .Where(m => m.SenderId == adminId || m.RecipientId == adminId)
                .Select(m => m.SenderId == adminId ? m.RecipientId : m.SenderId)
                .Distinct()
                .ToListAsync();

            if(userIds == null || !userIds.Any())
                return ResponseHelper.Success(new List<ChatUserModel>());

            var users = await _context.Users
                .Where(u => userIds.Contains(u.UserId) && u.UserId != adminId)
                .Select(u => new ChatUserModel
                {
                    UserId = u.UserId,
                    UserName = u.UserName,
                    IsOnline = _presenceService.IsOnline(u.UserId),
                    LastMessage = _context.Chats
                        .Where(m => (m.SenderId == u.UserId && m.RecipientId == adminId) ||
                                   (m.SenderId == adminId && m.RecipientId == u.UserId))
                        .OrderByDescending(m => m.SentDate)
                        .Select(m => m.Message)
                        .FirstOrDefault() ?? string.Empty,
                    LastMessageTime = _context.Chats
                        .Where(m => (m.SenderId == u.UserId && m.RecipientId == adminId) ||
                                   (m.SenderId == adminId && m.RecipientId == u.UserId))
                        .OrderByDescending(m => m.SentDate)
                        .Select(m => m.SentDate)
                        .FirstOrDefault()
                        
                })
                .OrderByDescending(u => u.LastMessageTime)
                .ToListAsync();
            return ResponseHelper.Success(users ?? new());
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<ResponseModel<List<MessageModel>>> GetChatMessageList(ChatHistoryRequestModel request)
    {
        try
        {
            if (request == null || request.UserId.IsNullOrWhiteSpace())
                return ResponseHelper.BadRequest<List<MessageModel>>();

            var isAdmin = await _tokenService.IsAdmin();

            var query = isAdmin
                ? await ChatMessageQueryAdmin(request)
                : await ChatMessageQuery();

            if (request.PageNo <= 0) request.PageNo = 1;
            if (request.PageSize <= 0) request.PageSize = 20;
            var skipCount = (request.PageNo - 1) * request.PageSize;

            var messageList = await query
                .Skip(skipCount)
                .Take(request.PageSize)
                .OrderBy(x => x.SentDate)
                .ToListAsync();

            return ResponseHelper.Success(messageList);
        }
        catch (Exception)
        {
            throw;
        }

    }

    private async Task<IQueryable<MessageModel>> ChatMessageQuery()
    {
        var userId = _tokenService.UserId;

        var query = from user in _context.Users
                    join chat in _context.Chats on user.UserId equals chat.SenderId

                    where (chat.SenderId == userId || chat.RecipientId == userId) &&
                    chat.IsDelete == false &&
                    user.IsDelete == false

                    orderby chat.SentDate descending

                    select new MessageModel
                    {
                        Id = chat.ChatId,
                        Message = chat.Message ?? string.Empty,
                        SenderId = chat.SenderId,
                        RecipientId = chat.RecipientId,
                        SentDate = chat.SentDate,
                        IsRead = chat.IsRead ?? false,
                    };

        return query;
    }

    private async Task<IQueryable<MessageModel>> ChatMessageQueryAdmin(ChatHistoryRequestModel request)
    {
        var query = from user in _context.Users
                    join chat in _context.Chats on user.UserId equals chat.SenderId

                    where (chat.SenderId == request.UserId || chat.RecipientId == request.UserId) &&
                    chat.IsDelete == false &&
                    user.IsDelete == false

                    orderby chat.SentDate descending

                    select new MessageModel
                    {
                        Id = chat.ChatId,
                        Message = chat.Message ?? string.Empty,
                        SenderId = chat.SenderId,
                        RecipientId = chat.RecipientId,
                        SentDate = chat.SentDate,
                        IsRead = chat.IsRead ?? false,
                    };

        return query;
    }
}
