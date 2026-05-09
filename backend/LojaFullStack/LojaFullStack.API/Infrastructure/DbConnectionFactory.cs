using Microsoft.Data.SqlClient;

namespace LojaFullStack.API.Infrastructure;

public class DbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public SqlConnection CreateConnection() => new(_connectionString);
}
