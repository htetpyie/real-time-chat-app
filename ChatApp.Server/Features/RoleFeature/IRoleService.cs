using Shared.Models;

namespace ChatApp.Server.Features.RoleFeature
{
    public interface IRoleService
    {
        Task<int> GetUserRoleId();
        Task<int> GetAdminRoleId();
        Task<string> GetRoleIdByUser(string userId);
        Task<bool> IsAdminRoleAsync(string roleId);
    }
}