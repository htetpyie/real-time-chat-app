using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Server.Hubs;

[Authorize]
public class ChatHub: Hub
{
    private readonly AppDbContext _dbContext;

    public ChatHub(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public override async Task OnConnectedAsync()   
    {
        var userId = Context.UserIdentifier;
        Console.WriteLine($"Connected user: {userId}");
        await base.OnConnectedAsync();
    }

    public async Task SendMessage(string receiverId, string message)
    {
        try
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId)) return;

            var chat = new Chat
            {
                SenderId = userId,
                ReceiverId = receiverId,
                Message = message,
                SentDate = DateTime.UtcNow.ToMyanmarDateTime(),
            };

            await _dbContext.Chats.AddAsync(chat);
            await _dbContext.SaveChangesAsync();

            await Clients.User(receiverId).SendAsync("ReceiveMessage", new
            {
                responseCode = 200,
                message = "Message sent",
                data = message,
                isSuccess = true
            });
        }
        catch (Exception)
        {
            throw;
        }
    }
}
