using LojaFullStack.API.Infrastructure;
using LojaFullStack.API.Repositories;
using LojaFullStack.API.Repositories.Interfaces;
using LojaFullStack.API.Services;
using LojaFullStack.API.Services.Interfaces;
using Microsoft.OpenApi;
using System.Reflection;

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
        Description = """
            API do sistema de vendas da loja.
            
            ## Funcionalidades
            - Gerenciamento de clientes
            - Gerenciamento de produtos e estoque
            - Criação e gerenciamento de pedidos
            
            ## Regras de Negócio
            - Um produto só pode ser adicionado ao pedido se houver estoque disponível
            - O valor total do pedido é atualizado automaticamente a cada alteração
            - O estoque é decrementado ao adicionar um item e devolvido ao remover
            """
    });

    // Habilita comentários XML
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
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
