using Microsoft.AspNetCore.Diagnostics;

namespace ChatApp.Server.Filters.Middleware;

public class ExceptionMiddleware : IExceptionHandler
{
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(ILogger<ExceptionMiddleware> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Global exception caught");

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new
        {
            ResponseCode = ConstantResponseCode.ERROR,
            Message = "An unexpected error occurred.",
            IsSuccess = false,
            Data = (object?)null
        }, cancellationToken);

        return true;
    }
}
