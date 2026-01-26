using System;
using System.Collections.Generic;

namespace ChatApp.Database.AppDbContextModels;

public partial class Message
{
    public int Id { get; set; }

    public int SenderId { get; set; }

    public int? ReceiverId { get; set; }

    public string? Content { get; set; }

    public DateTime? SentDate { get; set; }

    public bool? IsRead { get; set; }

    public bool? IsDelete { get; set; }

    public long? CreatedBy { get; set; }

    public DateTime? CreatedDate { get; set; }

    public long? ModifiedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }
}
