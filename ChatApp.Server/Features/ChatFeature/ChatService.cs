using ChatApp.Server.Features.TokenFeature;
using ChatApp.Server.Features.UserFeature;
using Shared.Models;
namespace ChatApp.Server.Features.ChatFeature;

public class ChatService : IChatService
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public ChatService(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<ResponseModel<List<ChatUserModel>>> GetChatUserList()
    {
        try
        {
            var isAdmin = await _tokenService.IsAdmin();

            var query = isAdmin
                ? GetAdminQuery()
                : GetUserListQueryAsync();
            var userList = await query.Distinct().ToListAsync();
            return ResponseHelper.Success(userList ?? new());
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<ResponseModel<string>> SaveMessage(ChatRequestModel request)
    {
        try
        {
            if (request == null)
                return ResponseHelper.BadRequest<string>();

            if (request.Message.Length > 450)
                return ResponseHelper.BadRequest<string>(ConstantResponseMessage.MessageTooLong);

            var isSenderAdmin = await _tokenService.IsAdmin();
            var tokenUser = _tokenService.UserId;

            var chat = new Chat
            {
                Message = request.Message,
                SenderId = isSenderAdmin ? tokenUser : request.UserId,
                RecipientId = isSenderAdmin ? request.UserId : tokenUser,
                CreatedDate = DateTime.UtcNow.ToMyanmarDateTime(),
                IsDelete = false,
            };

            await _context.Chats.AddAsync(chat);
            await _context.SaveChangesAsync();

            return ResponseHelper.Success<string>(request.UserId);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<ResponseModel<List<ChatMessageModel>>> GetChatMessageList(ChatHistoryRequestModel request)
    {
        try
        {
            if (request == null || request.UserId.IsNullOrWhiteSpace())
                return ResponseHelper.BadRequest<List<ChatMessageModel>>();

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

    private async Task<IQueryable<ChatMessageModel>> ChatMessageQuery()
    {

        var userId = _tokenService.UserId;

        var query = from user in _context.Users
                    join chat in _context.Chats on user.UserId equals chat.SenderId

                    where (chat.SenderId == userId || chat.RecipientId == userId) &&
                    chat.IsDelete == false &&
                    user.IsDelete == false

                    orderby chat.SentDate descending

                    select new ChatMessageModel
                    {
                        ChatId = chat.Id,
                        Message = chat.Message,
                        SenderId = chat.SenderId,
                        ReceiverId = chat.RecipientId,
                        SentDate = chat.SentDate,
                        IsRead = chat.IsRead ?? false,
                    };

        return query;
    }

    private async Task<IQueryable<ChatMessageModel>> ChatMessageQueryAdmin(ChatHistoryRequestModel request)
    {
        var query = from user in _context.Users
                    join chat in _context.Chats on user.UserId equals chat.SenderId

                    where (chat.SenderId == request.UserId || chat.RecipientId == request.UserId) &&
                    chat.IsDelete == false &&
                    user.IsDelete == false

                    orderby chat.SentDate descending

                    select new ChatMessageModel
                    {
                        ChatId = chat.Id,
                        Message = chat.Message,
                        SenderId = chat.SenderId,
                        ReceiverId = chat.RecipientId,
                        SentDate = chat.SentDate,
                        IsRead = chat.IsRead ?? false,
                    };

        return query;
    }

    private IQueryable<ChatUserModel> GetUserListQueryAsync()
    {
        return from user in _context.Users
               join role in _context.Roles on user.RoleId equals role.Id
               join c in _context.Chats.Where(x => x.IsDelete == false) on user.UserId equals c.SenderId into userChat
               from chat in userChat.DefaultIfEmpty()

               where role.Name == ConstantRoleName.Admin &&
                user.IsDelete == false &&
                role.IsDelete == false

               orderby chat.SentDate descending

               select new ChatUserModel
               {
                   UserId = user.UserId,
                   UserName = user.UserName,
                   LastMessage = _context.Chats
                    .AsNoTracking()
                    .Where(x => x.SenderId == user.UserId || x.RecipientId == user.UserId)
                    .Select(x => x.Message)
                    .FirstOrDefault() ?? string.Empty,
               };
    }

    private IQueryable<ChatUserModel> GetAdminQuery()
    {
        var query = from user in _context.Users
                    join role in _context.Roles on user.RoleId equals role.Id
                    join chat in _context.Chats on user.UserId equals chat.SenderId

                    where role.Name != ConstantRoleName.Admin &&
                     (chat.SenderId == user.UserId || chat.RecipientId == user.UserId) &&
                     user.IsDelete == false &&
                     chat.IsDelete == false &&
                     role.IsDelete == false

                    orderby chat.SentDate descending

                    select new ChatUserModel
                    {
                        UserId = user.UserId,
                        UserName = user.UserName,
                        LastMessage = chat.Message,
                    };

        return query;
    }
}
