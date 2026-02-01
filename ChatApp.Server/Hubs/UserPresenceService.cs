using System.Collections.Concurrent;

namespace ChatApp.Server.Hubs;

public class UserPresenceService : IUserPresenceService
{
    private static readonly ConcurrentDictionary<string, string> _userConnections = new();
    private static readonly ConcurrentDictionary<string, bool> _onlineUsers = new();

    public void UserConnected(string userId, string connectionId)
    {
        _userConnections[userId] = connectionId;
        _onlineUsers[userId] = true;
    }

    public void UserDisconnected(string userId)
    {
        _userConnections.TryRemove(userId, out _);
        _onlineUsers.TryRemove(userId, out _);
    }

    public bool IsOnline(string userId) => _onlineUsers.ContainsKey(userId);

    public List<string> GetOnlineUsers() => _onlineUsers.Keys.ToList();

    public string? GetConnectionId(string userId) =>
        _userConnections.TryGetValue(userId, out var connId) ? connId : null;
}
