using System;
using System.Collections.Generic;

namespace ChatApp.Database.AppDbContextModels;

public partial class User
{
    public long Id { get; set; }

    public string UserId { get; set; } = null!;

    public string UserName { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? PhoneNo { get; set; }

    public int GenderId { get; set; }

    public byte[] SaltKey { get; set; } = null!;

    public byte[] Password { get; set; } = null!;

    public string? Address { get; set; }

    public int RoleId { get; set; }

    public bool? IsDelete { get; set; }

    public long? CreatedBy { get; set; }

    public DateTime? CreatedDate { get; set; }

    public long? ModifiedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }
}
