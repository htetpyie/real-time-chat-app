using ChatApp.Server.Features.AuthFeature;
using ChatApp.Server.Features.ChatFeature;
using ChatApp.Server.Features.TokenFeature;
using ChatApp.Server.Filters.Middleware;
using ChatApp.Server.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Shared.Models;
using System.Reflection;
using System.Text;

Log.Logger = new LoggerConfiguration()
           .MinimumLevel.Information()
           .WriteTo.Console()
           .WriteTo.File($"logs/{Assembly.GetEntryAssembly()?.GetName().Name}.log", rollingInterval: RollingInterval.Hour)
           .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

#region Database Connection
string dbConnection = builder.Configuration.GetConnectionString("MYSQLDBConnection")!;
builder.Services.AddDbContext<AppDbContext>(
    options => options.UseMySql(dbConnection, ServerVersion.AutoDetect(dbConnection)));
#endregion


#region Signal R
builder.Services.AddSignalR();
#endregion

#region JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
 {
     options.TokenValidationParameters = new TokenValidationParameters
     {
         ValidateIssuer = true,
         ValidateAudience = true,
         ValidateLifetime = true,
         ValidateIssuerSigningKey = true,
         ValidIssuer = builder.Configuration["JwtSetting:Issuer"],
         ValidAudience = builder.Configuration["JwtSetting:Audience"],
         IssuerSigningKey = new SymmetricSecurityKey(
             Encoding.UTF8.GetBytes(builder.Configuration["JwtSetting:Key"]
             ?? throw new Exception("JWT Key missing in config"))),
         ClockSkew = TimeSpan.Zero
     };

     options.Events = new JwtBearerEvents
     {
         OnMessageReceived = context =>
         {
             var accessToken = context.Request.Query["access_token"];
             var path = context.HttpContext.Request.Path;

             if (!string.IsNullOrEmpty(accessToken)
                 && path.StartsWithSegments(ConstantHubConnection.ChatHub))
             {
                 context.Token = accessToken;
             }

             return Task.CompletedTask;
         }
     };
 });

builder.Services.AddAuthorization();

#endregion

#region Swagger JWT
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
});
#endregion

#region CORS Ploicy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:3000", "https://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});
#endregion

builder.Services.AddMemoryCache();
builder.Services.AddControllers();
builder.Services.Configure<AppSettingModel>(builder.Configuration);
builder.Services.AddHttpContextAccessor();

builder.Services.AddExceptionHandler<ExceptionMiddleware>();
builder.Services.AddProblemDetails();

#region Injections
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IChatService, ChatService>();

#endregion

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowClient");

//app.UseHttpsRedirection();

app.UseExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>(ConstantHubConnection.ChatHub);

app.Run();
