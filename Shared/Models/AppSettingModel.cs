using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Models;

public class AppSettingModel
{
    public JwtSetting? JwtSetting { get; set; }
}

public class JwtSetting
{
    public string? Key { get; set; }
    public string? Issuer { get; set; }
    public string? Audience { get; set; }
    public double TokenMinute { get;set; }
}
