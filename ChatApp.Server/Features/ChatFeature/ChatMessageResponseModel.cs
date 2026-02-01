namespace ChatApp.Server.Features.ChatFeature;

public class ChatHistoryRequestModel
{
    public string UserId { get; set; }
    public int PageNo { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
