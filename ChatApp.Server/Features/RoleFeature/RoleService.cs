using Shared.Models;

namespace ChatApp.Server.Features.RoleFeature;
public class RoleService : IRoleService
{
    private readonly AppDbContext _context;
    public RoleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<RoleInfoModel> GetRoleByUser(string userId)
    {
        var query = from role in _context.Roles
                    join user in _context.Users on role.Id equals user.RoleId
                    where user.UserId == userId &&
                        user.IsDelete == false &&
                        role.IsDelete == false
                    select new RoleInfoModel
                    {
                        RoleId = role.RoleId,
                        IsAdmin = role.Name == ConstantRoleName.Admin
                    };
        return await query.FirstOrDefaultAsync() ?? new();
    }

    public async Task<int> GetUserRoleId()
    {
        return await _context.Roles
            .AsNoTracking()
            .Where(x =>
                x.Name.ToLower().Trim() == ConstantRoleName.User.ToLower() &&
                x.IsDelete == false)
            .Select(x => x.Id)
            .FirstOrDefaultAsync();
    }

    public async Task<int> GetAdminRoleId()
    {
        return await _context.Roles
            .AsNoTracking()
            .Where(x =>
                x.Name.ToLower().Trim() == ConstantRoleName.Admin.ToLower() &&
                x.IsDelete == false)
            .Select(x => x.Id)
            .FirstOrDefaultAsync();
    }

    public async Task<string> GetAdminUserId()
    {
        var adminRoleid = await GetAdminRoleId();

        return await _context.Users
            .AsNoTracking()
            .Where(x =>
                x.RoleId == adminRoleid &&
                x.IsDelete == false)
            .Select(x => x.UserId)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> IsAdminRoleAsync(string roleId)
    {
        var role = await _context.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.RoleId == roleId &&
                x.Name == ConstantRoleName.Admin &&
                x.IsDelete == false);

        return role != null;
    }
}
