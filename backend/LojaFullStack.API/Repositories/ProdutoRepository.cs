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

    public async Task DeleteAsync(int codProduto)
    {
        using var conn = _factory.CreateConnection();
        await conn.OpenAsync();
        using var transaction = await conn.BeginTransactionAsync();

        try
        {
            // 1. Deletar itens de pedidos que contém este produto
            var queryItens = "DELETE FROM ItensPedido WHERE CodProduto = @Id";
            await conn.ExecuteAsync(queryItens, new { Id = codProduto }, transaction);

            // 2. Deletar o produto
            var queryProduto = "DELETE FROM Produto WHERE CodProduto = @Id";
            await conn.ExecuteAsync(queryProduto, new { Id = codProduto }, transaction);

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
