using Shared.Models;

namespace ChatApp.Server.Features.AuthFeature
{
    public interface IAuthService
    {
        Task<ResponseModel<LoginResponseModel>> LoginAsync(LoginRequestModel request);
        Task<ResponseModel<RegisterResponseModel>> RegisterAsync(RegisterRequestModel request);
    }
}