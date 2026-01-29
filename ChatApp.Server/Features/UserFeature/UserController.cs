using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Server.Features.UserFeature
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        [HttpGet("Testing")]
        [Authorize]
        [AdminAuthorize]
        public IActionResult Test()
        {
            return Ok("Valid Token");
        }
    }
}
