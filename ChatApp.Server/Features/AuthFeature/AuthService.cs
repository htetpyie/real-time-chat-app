using ChatApp.Server.Features.UserFeature;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Shared.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Shared;

namespace ChatApp.Server.Features.AuthFeature;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly AppSettingModel _setting;
    private readonly IRoleService _rolService;

    public AuthService(AppDbContext context,
        IOptionsMonitor<AppSettingModel> setting,
        IRoleService rolService)
    {
        _context = context;
        _setting = setting.CurrentValue;
        _rolService = rolService;
    }

    public async Task<ResponseModel<LoginResponseModel>> LoginAsync(LoginRequestModel request)
    {
        try
        {
            if (request is null || request.UserName.IsNullOrWhiteSpace() || request.Password.IsNullOrWhiteSpace())
                return ResponseHelper.BadRequest<LoginResponseModel>(ConstantResponseMessage.UserNameAndPasswordIsRequired);

            var loginResponse = await AuthenticateAsync(request);
            return loginResponse;
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<ResponseModel<RegisterResponseModel>> RegisterAsync(RegisterRequestModel request)
    {
        try
        {
            if (request is null
            || request.UserName.IsNullOrWhiteSpace()
            || request.Password.IsNullOrWhiteSpace())
                return ResponseHelper.BadRequest<RegisterResponseModel>();

            if (await IsUserExist(request))
                return ResponseHelper.BadRequest<RegisterResponseModel>(
                    ConstantResponseMessage.UserNameExisted);

            var userId = await SaveUser(request);
            return ResponseHelper.Success<RegisterResponseModel>(
                new RegisterResponseModel { UserId = userId },
                ConstantResponseMessage.RegisterSuccessfully);
        }
        catch (Exception)
        {
            throw;
        }

    }

    private async Task<ResponseModel<LoginResponseModel>> AuthenticateAsync(LoginRequestModel request)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.UserName == request.UserName!.ToLower() &&
                x.IsDelete == false);

        if (user == null)
            return ResponseHelper.BadRequest<LoginResponseModel>(ConstantResponseMessage.UserNotFound);

        var validPassword = request.Password!.VerifyPassword(user.Password, user.SaltKey);

        if (!validPassword)
            return ResponseHelper.BadRequest<LoginResponseModel>(ConstantResponseMessage.InvalidCredential);

        var role = await _rolService.GetRoleByUser(user.UserId);
        if (role.RoleId.IsNullOrWhiteSpace())
            return ResponseHelper.BadRequest<LoginResponseModel>(ConstantResponseMessage.RoleNotFound);

        return ResponseHelper.Success(
            new LoginResponseModel
            {
                UserId = user.UserId,
                UserName = user.UserName,
                IsAdmin = role.IsAdmin,
                Token = GenerateJWTToken(new UserModel
                {
                    UserId = user.UserId,
                    RoleId = role.RoleId,
                })
            });
    }

    private async Task<string> SaveUser(RegisterRequestModel request)
    {
        var saltKey = Extensions.GenerateSalt();
        var hashedPassword = request.Password!.HashPassword(saltKey);
        var userRoleId = request.IsAdmin 
            ? await _rolService.GetAdminRoleId()
            : await _rolService.GetUserRoleId();

        var user = new User
        {
            UserName = request.UserName!.ToLower(),
            Password = hashedPassword,
            UserId = Guid.NewGuid().ToString(),
            SaltKey = saltKey,
            RoleId = userRoleId,
            CreatedDate = DateTime.Now.ToMyanmarDateTime(),
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user.UserId;
    }
    
    private async Task<bool> IsUserExist(RegisterRequestModel request)
    {
        return await _context.Users
            .AnyAsync(x => x.UserName.Trim().ToLower() == request.UserName!.Trim().ToLower() && x.IsDelete == false);
    }

    private string GenerateJWTToken(UserModel data)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_setting.JwtSetting.Key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ConstantClaimCode.UserId, data.UserId),
            new Claim(ConstantClaimCode.RoleId, data.RoleId),
            new Claim(ClaimTypes.NameIdentifier, data.UserId),
        };

        var token = new JwtSecurityToken(
            issuer: _setting.JwtSetting.Issuer,
            audience: _setting.JwtSetting.Audience,
            claims: claims,
            expires: DateTime.Now.AddMinutes(_setting.JwtSetting.TokenMinute),
            notBefore: DateTime.Now,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
