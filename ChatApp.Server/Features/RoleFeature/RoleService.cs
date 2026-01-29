using Shared.Models;

namespace ChatApp.Server.Features.RoleFeature;
public class RoleService : IRoleService
{
    private readonly AppDbContext _context;
    public RoleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<string> GetRoleIdByUser(string userId)
    {
        var query = from role in _context.Roles
                     join user in _context.Users on role.Id equals user.RoleId
                     where user.UserId == userId &&
                         user.IsDelete == false &&
                         role.IsDelete == false
                     select role.RoleId;
        return await query.FirstOrDefaultAsync() ?? string.Empty;
    }

    public async Task<int> GetUserRoleId()
    {
        return await _context.Roles
            .AsNoTracking()
            .Where(x => x.Name.ToLower().Trim() == ConstantRoleName.User.ToLower() && x.IsDelete == false)
            .Select(x => x.Id)
            .FirstOrDefaultAsync();
    }
}
