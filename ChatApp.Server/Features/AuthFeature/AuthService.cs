using ChatApp.Database.AppDbContextModels;

namespace ChatApp.Server.Features.AuthFeature;

public class AuthService
{
    private readonly AppDbContext _context;

    public AuthService(AppDbContext context)
    {
        _context = context;
    }

    //public async Task<bool> AuthenticateAsync(AuthenticationViewModel model)
    //{
    //    if (model is null) return false;

    //    var user = await _context
    //        .Users
    //        .AsNoTracking()
    //        .FirstOrDefaultAsync(x => x.UserName == model.UserName.ToLower() && x.IsDelete == false);

    //    if (user == null) return false;

    //    bool isPasswordValid = _baseService.VerifyPasswordHash(model.Password, user.Password, user.SaltKey);

    //    return isPasswordValid;
    //}

    //public async Task<UserViewModel> GetLoginDataByUserNameAsync(string userName)
    //{

    //    var user = await (from u in _context.Users
    //               join r in _context.Roles on u.RoleId equals r.Id
    //               where u.UserName.ToLower() == userName &&
    //               u.IsDelete == false &&
    //               r.IsDelete == false
    //               select new UserViewModel
    //               {
    //                   UserName = u.UserName,
    //                   FullName = u.FullName,
    //                   Id = u.Id,
    //                   RoleId = u.RoleId,
    //                   RoleName = r.Name,
    //                   IsSystemDefinedRole = r.IsSystemDefined,
    //               })
    //               .FirstOrDefaultAsync();

    //    return user;
    //}        
}
