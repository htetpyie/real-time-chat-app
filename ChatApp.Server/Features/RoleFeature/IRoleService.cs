using Shared.Models;

namespace ChatApp.Server.Features.RoleFeature
{
    public interface IRoleService
    {
        Task<int> GetUserRoleId();
        Task<string> GetRoleIdByUser(string userId);
    }
}