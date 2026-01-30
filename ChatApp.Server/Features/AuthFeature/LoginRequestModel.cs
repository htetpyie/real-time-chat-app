namespace ChatApp.Server.Features.AuthFeature;

public class LoginRequestModel
{
    public string? UserName { get; set; }

    public string? Password { get; set; }
}

public class LoginResponseModel
{
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public bool IsAdmin{ get; set; }
    public string? Token { get; set; }
}
