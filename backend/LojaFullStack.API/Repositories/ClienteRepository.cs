using Dapper;
using LojaFullStack.API.Infrastructure;
using LojaFullStack.API.Models;
using LojaFullStack.API.Repositories.Interfaces;

namespace LojaFullStack.API.Repositories;

public class ClienteRepository : IClienteRepository
{
    private readonly DbConnectionFactory _factory;

    public ClienteRepository(DbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<IEnumerable<Cliente>> GetAllAsync()
    {
        using var conn = _factory.CreateConnection();
        var query = @$"SELECT * FROM dbo.Cliente ORDER BY Nome";

        var result = await conn.QueryAsync<Cliente>(query);
        return result;
    }

    public async Task<Cliente?> GetByIdAsync(int id)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"SELECT * FROM Cliente WHERE CodCliente = @Id";

        var result = await conn.QueryFirstOrDefaultAsync<Cliente>(query, new { Id = id });
        return result;
    }

    public async Task<Cliente?> GetByCNPJAsync(string cnpj)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"SELECT * FROM Cliente WHERE CNPJ = @CNPJ";

        var result = await conn.QueryFirstOrDefaultAsync<Cliente>(query, new { CNPJ = cnpj });
        return result;
    }

    public async Task<int> CreateAsync(Cliente cliente)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"
            INSERT INTO Cliente (CNPJ, Nome, Email, DataCadastro)
            VALUES (@CNPJ, @Nome, @Email, GETDATE());
            SELECT CAST(SCOPE_IDENTITY() AS INT);
        ";

        var result = await conn.ExecuteScalarAsync<int>(query, cliente);
        return result;
    }

    public async Task UpdateAsync(Cliente cliente)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"UPDATE Cliente SET Nome = @Nome, Email = @Email WHERE CodCliente = @CodCliente";

        await conn.ExecuteAsync(query, cliente);
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _factory.CreateConnection();
        await conn.OpenAsync();
        using var transaction = await conn.BeginTransactionAsync();

        try
        {
            // 1. Deletar itens de todos os pedidos do cliente
            var queryItens = @"DELETE FROM ItensPedido WHERE CodPedido IN (SELECT CodPedido FROM Pedido WHERE CodCliente = @Id)";
            await conn.ExecuteAsync(queryItens, new { Id = id }, transaction);

            // 2. Deletar pedidos do cliente
            var queryPedidos = @"DELETE FROM Pedido WHERE CodCliente = @Id";
            await conn.ExecuteAsync(queryPedidos, new { Id = id }, transaction);

            // 3. Deletar o cliente
            var queryCliente = @"DELETE FROM Cliente WHERE CodCliente = @Id";
            await conn.ExecuteAsync(queryCliente, new { Id = id }, transaction);

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
