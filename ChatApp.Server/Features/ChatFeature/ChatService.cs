namespace ChatApp.Server.Features.ChatFeature;

public class ChatService
{
    private readonly AppDbContext _context;

    public ChatService(AppDbContext context)
    {
        _context = context;
    }
}

