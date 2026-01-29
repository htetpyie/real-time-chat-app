using Shared.Models;

namespace ChatApp.Server.Features.UserFeature;

public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }
}
