using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace ChatApp.Server.Features.ChatFeature;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet("users")]
    //[AdminAuthorize]
    public async Task<IActionResult> GetUsers()
    {
        var result = await _chatService.GetChatUserList();
        return Ok(result);
    }

    [HttpPost("history")]
    public async Task<IActionResult> GetHistory([FromBody] ChatHistoryRequestModel request)
    {
        var result = await _chatService.GetChatMessageList(request);
        return Ok(result);
    }
}
