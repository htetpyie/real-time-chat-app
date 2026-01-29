namespace ChatApp.Server.Features.AuthFeature;

public class RegisterRequestModel
{
    public string? UserName { get; set; }
    public string? Password { get; set; }
}

public class RegisterResponseModel
{
    public string? UserId { get; set; }
}
