using Shared.Constants;

namespace Shared.Models;

public class ResponseModel<T>
{
    public int ResponseCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public bool IsSuccess => ResponseCode >= 200 && ResponseCode < 300;
}

public class ResponseHelper
{
    public static ResponseModel<T> Success<T>(T data, string message = "Success")
    {
        return new ResponseModel<T>
        {
            ResponseCode = ConstantResponseCode.SUCCESS,
            Message = message,
            Data = data
        };
    }

    public static ResponseModel<T> Error<T>(string message = "Something went wrong!")
    {
        return new ResponseModel<T>
        {
            ResponseCode = ConstantResponseCode.ERROR,
            Message = message,
        };
    }

    public static ResponseModel<T> BadRequest<T>(string message = "Bad Request!")
    {
        return new ResponseModel<T>
        {
            ResponseCode = ConstantResponseCode.BADREQUEST,
            Message = message,
        };
    }
}
