using Shared.Models;
using static ChatApp.Server.Hubs.ChatHub;

namespace ChatApp.Server.Features.ChatFeature
{
    public interface IChatService
    {
        Task<ResponseModel<List<MessageModel>>> GetChatMessageList(ChatHistoryRequestModel request);
        Task<ResponseModel<List<ChatUserModel>>> GetChatUserList();
        Task<ResponseModel<object>> MaskAsRead(MarkAsReadRequest request);
    }
}