
namespace ChatApp.Server.Hubs
{
    public interface IUserPresenceService
    {
        string? GetConnectionId(string userId);
        List<string> GetOnlineUsers();
        bool IsOnline(string userId);
        void UserConnected(string userId, string connectionId);
        void UserDisconnected(string userId);
    }
}