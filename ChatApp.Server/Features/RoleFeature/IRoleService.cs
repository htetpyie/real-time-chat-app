using Shared.Models;

namespace ChatApp.Server.Features.RoleFeature
{
    public interface IRoleService
    {
        Task<int> GetUserRoleId();
        Task<int> GetAdminRoleId();
        Task<RoleInfoModel> GetRoleByUser(string userId);
        Task<bool> IsAdminRoleAsync(string roleId);
    }
}