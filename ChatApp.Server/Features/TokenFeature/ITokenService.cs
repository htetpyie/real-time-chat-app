
namespace ChatApp.Server.Features.TokenFeature
{
    public interface ITokenService
    {
        string UserId { get; }

        Task<bool> IsAdmin();
    }
}