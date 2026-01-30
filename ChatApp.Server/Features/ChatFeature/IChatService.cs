using Shared.Models;

namespace ChatApp.Server.Features.ChatFeature
{
    public interface IChatService
    {
        Task<ResponseModel<List<ChatMessageModel>>> GetChatMessageList(ChatHistoryRequestModel request);
        Task<ResponseModel<List<ChatUserModel>>> GetChatUserList();
        Task<ResponseModel<string>> SaveMessage(ChatRequestModel request);
    }
}