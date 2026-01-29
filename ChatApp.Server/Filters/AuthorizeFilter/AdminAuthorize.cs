using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace ChatApp.Server.Filters.AuthorizeFilter;

public class AdminAuthorize : Attribute, IAsyncAuthorizationFilter
{

    public AdminAuthorize()
    {
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        if (!user.Identity!.IsAuthenticated)
        {
            context.Result = new UnauthorizedResult();
            await UnAuthorizedResponse(context);
            return;
        }

        var roleIdClaim = user.FindFirst(ConstantClaimCode.RoleId)?.Value;
        var userIdClaim = user.FindFirst(ConstantClaimCode.UserId)?.Value;

        if (roleIdClaim == null || userIdClaim == null)
        {
            context.Result = new ForbidResult();
            await ForbidenResponse(context);
            return;
        }

        var roleService = context.HttpContext.RequestServices.GetRequiredService<IRoleService>();
        var isAdmin = await roleService.IsAdminRoleAsync(roleIdClaim);
        if (!isAdmin)
        {
            context.Result = new ForbidResult();
            await ForbidenResponse(context);
        }
    }

    public async Task UnAuthorizedResponse(AuthorizationFilterContext context)
    {
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            ResponseCode = ConstantResponseCode.UNAUTHORIZED,
            Message = "Invalid token.",
            IsSuccess = false,
            Data = (object?)null
        });
    }

    public async Task ForbidenResponse(AuthorizationFilterContext context)
    {
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            ResponseCode = ConstantResponseCode.FORBIDDEN,
            Message = "Authorization failed.",
            IsSuccess = false,
            Data = (object?)null
        });
    }
}