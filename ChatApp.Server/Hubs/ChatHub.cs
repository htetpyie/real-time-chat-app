using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Server.Hubs;

[Authorize]
public class ChatHub: Hub
{
    public override async Task OnConnectedAsync()   
    {
        var userId = Context.UserIdentifier;
        Console.WriteLine($"Connected user: {userId}");
        await base.OnConnectedAsync();
    }
}
