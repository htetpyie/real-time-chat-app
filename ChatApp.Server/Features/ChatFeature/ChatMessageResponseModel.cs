namespace ChatApp.Server.Features.ChatFeature;


public class ChatMessageModel
{
    public long ChatId { get; set; }
    public string SenderId { get; set; }
    public string ReceiverId { get; set; }
    public string Message { get; set; }
    public DateTime? SentDate { get; set; }
    public string SentDateString => SentDate.ToDateTimeString();
}

public class ChatHistoryRequestModel
{
    public string UserId { get; set; }
    public int PageNo { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
