using Dapper;
using LojaFullStack.API.Infrastructure;
using LojaFullStack.API.Models;
using LojaFullStack.API.Repositories.Interfaces;

namespace LojaFullStack.API.Repositories;

public class ProdutoRepository : IProdutoRepository
{
    private readonly DbConnectionFactory _factory;

    public ProdutoRepository(DbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<IEnumerable<Produto>> GetAllAsync()
    {
        using var conn = _factory.CreateConnection();
        var query = @$"SELECT * FROM Produto ORDER BY Nome";

        var result = await conn.QueryAsync<Produto>(query);
        return result;
    }

    public async Task<Produto?> GetByIdAsync(int id)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"SELECT * FROM Produto WHERE CodProduto = @Id";

        var result = await conn.QueryFirstOrDefaultAsync<Produto>(query, new { Id = id });
        return result;
    }

    public async Task<int> CreateAsync(Produto produto)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"
            INSERT INTO Produto (Nome, Preco, Estoque)
            VALUES (@Nome, @Preco, @Estoque);
            SELECT CAST(SCOPE_IDENTITY() AS INT);
        ";

        var result = await conn.ExecuteScalarAsync<int>(query, produto);
        return result;
    }

    public async Task UpdateEstoqueAsync(int codProduto, int novoEstoque)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"UPDATE Produto SET Estoque = @Estoque WHERE CodProduto = @Id";

        await conn.ExecuteAsync(query,
            new { Estoque = novoEstoque, Id = codProduto });
    }

    public async Task UpdateAsync(Produto produto)
    {
        using var conn = _factory.CreateConnection();
        var query = @"UPDATE Produto SET Nome = @Nome, Preco = @Preco, Estoque = @Estoque WHERE CodProduto = @CodProduto";

        await conn.ExecuteAsync(query, produto);
    }

    public async Task<bool> HasItemsAsync(int codProduto)
    {
        using var conn = _factory.CreateConnection();
        var query = "SELECT COUNT(1) FROM ItensPedido WHERE CodProduto = @Id";

        var count = await conn.ExecuteScalarAsync<int>(query, new { Id = codProduto });
        return count > 0;
    }

    public async Task<Produto?> GetByNameAsync(string nome)
    {
        using var conn = _factory.CreateConnection();
        var query = "SELECT * FROM Produto WHERE Nome = @Nome";
        return await conn.QueryFirstOrDefaultAsync<Produto>(query, new { Nome = nome });
    }

    public async Task DeleteAsync(int codProduto)
    {
        using var conn = _factory.CreateConnection();
        var query = "DELETE FROM Produto WHERE CodProduto = @Id";
        await conn.ExecuteAsync(query, new { Id = codProduto });
    }
}
