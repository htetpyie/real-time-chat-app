using BCrypt.Net;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Security.Cryptography;
using TimeZoneConverter;

namespace Shared;
public static class Extensions
{

    public static DateTime ToMyanmarDateTime(this DateTime dateTime)
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TZConvert.GetTimeZoneInfo("Asia/Yangon"));
    }

    public static string HashPassword(this string password, string salt)
    {
        return BCrypt.Net.BCrypt.HashPassword(password + salt);
    }

    public static bool VerifyPassword(this string password, string hashedPassword, string salt)
    {
        return BCrypt.Net.BCrypt.Verify(password + salt, hashedPassword);
    }

    public static bool IsNullOrWhiteSpace(this string? value)
    {
        if (value == null) return true;

        for (int i = 0; i < value.Length; i++)
        {
            if (!char.IsWhiteSpace(value[i])) return false;
        }

        return true;
    }

    public static string GenerateSalt(int size = 22)
    {
        byte[] saltBytes = new byte[size];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(saltBytes);
        }

        return Convert.ToBase64String(saltBytes).Substring(0, size);
    }

    #region Password Generator
    public static string GeneratePassword(int length = 12)
    {
        if (length < 8)
            throw new ArgumentException("Password length should be at least 8 characters.");

        const string allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
        var password = new char[length];

        for (int i = 0; i < length; i++)
        {
            password[i] = allChars[RandomNumberGenerator.GetInt32(allChars.Length)];
        }

        return new string(password);
    }
    #endregion
}
