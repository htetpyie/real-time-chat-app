using System;
using System.Collections.Generic;

namespace ChatApp.Database.AppDbContextModels;

public partial class Chat
{
    public long Id { get; set; }

    public string SenderId { get; set; } = null!;

    public string? ReceiverId { get; set; }

    public string? Message { get; set; }

    public DateTime? SentDate { get; set; }

    public bool? IsRead { get; set; }

    public bool? IsDelete { get; set; }

    public long? CreatedBy { get; set; }

    public DateTime? CreatedDate { get; set; }

    public long? ModifiedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }
}
