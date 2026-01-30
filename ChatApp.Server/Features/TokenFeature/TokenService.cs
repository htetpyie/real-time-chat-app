namespace ChatApp.Server.Features.TokenFeature;

public class TokenService : ITokenService
{
    private readonly IHttpContextAccessor context;
    private readonly IRoleService _roleService;

    public TokenService(IHttpContextAccessor httpContext, IRoleService roleService)
    {
        context = httpContext;
        _roleService = roleService;
    }

    public string UserId => GetUser().UserId;

    public async Task<bool> IsAdmin()
    {
        var user = GetUser();
        if (user == null) return false;

        var isAdmin = await _roleService.IsAdminRoleAsync(user.RoleId);
        return isAdmin;
    }


    private TokenPayload GetUser()
    {
        var user = context?.HttpContext?.User;
        if (user == null || !user.Identity!.IsAuthenticated)
        {
            return new();
        }

        var roleIdClaim = user.FindFirst(ConstantClaimCode.RoleId)?.Value;
        var userIdClaim = user.FindFirst(ConstantClaimCode.UserId)?.Value;

        return new TokenPayload
        {
            RoleId = roleIdClaim,
            UserId = userIdClaim
        };
    }

}

public class TokenPayload
{
    public string UserId { get; set; }
    public string RoleId { get; set; }
}


