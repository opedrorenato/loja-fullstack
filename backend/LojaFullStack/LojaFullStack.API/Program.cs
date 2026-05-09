using LojaFullStack.API.Infrastructure;
using LojaFullStack.API.Repositories;
using LojaFullStack.API.Repositories.Interfaces;
using LojaFullStack.API.Services;
using LojaFullStack.API.Services.Interfaces;
using Microsoft.OpenApi;

// Builder
var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Connection Factory
builder.Services.AddSingleton<DbConnectionFactory>();

// Services
builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<IProdutoService, ProdutoService>();
builder.Services.AddScoped<IPedidoService, PedidoService>();

// Repositories
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IProdutoRepository, ProdutoRepository>();
builder.Services.AddScoped<IPedidoRepository, PedidoRepository>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Loja FullStack - API",
        Version = "v1",
        Description = "API do sistema de vendas da Loja FullStack"
    });
});

// CORS — libera o frontend Next.js acessar a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// App
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Loja FullStack - API");
    c.RoutePrefix = string.Empty;
});

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();
