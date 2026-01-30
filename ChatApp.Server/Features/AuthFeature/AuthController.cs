using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Server.Features.AuthFeature;


[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("Login")]
    public async Task<IActionResult> LoginAsync(
        [FromBody] LoginRequestModel request,
        IAuthService authService)
    {
        var result = await authService.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("Register")]
    public async Task<IActionResult> RegisterAsync(
        [FromBody] RegisterRequestModel request,
        IAuthService authService)
    {
        var result = await authService.RegisterAsync(request);
        return Ok(result);
    }
}
