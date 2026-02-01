namespace ChatApp.Server.Features.ChatFeature;

public class ChatUserModel
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public bool IsOnline{ get; set; }
    public string LastMessage { get; set; } = string.Empty;
    //public DateTime? LastMessageDate { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public string lastSeen => LastMessageTime.TimeAgo();
    public int UnreadCount { get; set; } = 0;
}
