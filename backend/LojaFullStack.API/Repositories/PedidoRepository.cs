using Dapper;
using LojaFullStack.API.DTOs;
using LojaFullStack.API.Infrastructure;
using LojaFullStack.API.Models;
using LojaFullStack.API.Repositories.Interfaces;

namespace LojaFullStack.API.Repositories;

public class PedidoRepository : IPedidoRepository
{
    private readonly DbConnectionFactory _factory;

    public PedidoRepository(DbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<IEnumerable<PedidoResponseDto>> GetAllAsync(DateTime? dataInicio, DateTime? dataFim, string? cnpj)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"
            SELECT  p.CodPedido, p.CodCliente, p.DataPedido, p.ValorTotal,
                    c.Nome AS NomeCliente, c.CNPJ AS CNPJCliente
            FROM Pedido p
            INNER JOIN Cliente c ON c.CodCliente = p.CodCliente
            WHERE 1 = 1
        ";

        var parameters = new DynamicParameters();

        if (dataInicio.HasValue)
        {
            query += " AND CAST(p.DataPedido AS DATE) >= @DataInicio";
            parameters.Add("DataInicio", dataInicio.Value.Date);
        }

        if (dataFim.HasValue)
        {
            query += " AND CAST(p.DataPedido AS DATE) <= @DataFim";
            parameters.Add("DataFim", dataFim.Value.Date);
        }

        if (!string.IsNullOrWhiteSpace(cnpj))
        {
            query += " AND c.CNPJ = @CNPJ";
            parameters.Add("CNPJ", cnpj);
        }

        query += " ORDER BY p.DataPedido DESC";

        var result = await conn.QueryAsync<PedidoResponseDto>(query, parameters);
        return result;
    }

    public async Task<PedidoResponseDto?> GetByIdAsync(int id)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"
            SELECT  p.CodPedido, p.CodCliente, p.DataPedido, p.ValorTotal,
                    c.Nome AS NomeCliente, c.CNPJ AS CNPJCliente
            FROM Pedido p
            INNER JOIN Cliente c ON c.CodCliente = p.CodCliente
            WHERE p.CodPedido = @Id
        ";

        var pedido = await conn.QueryFirstOrDefaultAsync<PedidoResponseDto>(query, new { Id = id });

        if (pedido is null)
            return null;

        var itensSql = @$"
            SELECT  ip.CodProduto, ip.Quantidade, ip.PrecoUnitario,
                    pr.Nome AS NomeProduto
            FROM ItensPedido ip
            INNER JOIN Produto pr ON pr.CodProduto = ip.CodProduto
            WHERE ip.CodPedido = @Id
        ";

        pedido.Itens = (await conn.QueryAsync<ItensPedidoResponseDto>(itensSql, new { Id = id }))
            .ToList();

        return pedido;
    }

    public async Task<int> CreateAsync(int codCliente)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"
            INSERT INTO Pedido (CodCliente, DataPedido, ValorTotal)
            VALUES (@CodCliente, GETDATE(), 0);
            SELECT CAST(SCOPE_IDENTITY() AS INT);
        ";

        var result = await conn.ExecuteScalarAsync<int>(query, new { CodCliente = codCliente });
        return result;
    }

    public async Task AddItemAsync(int codPedido, ItensPedido item)
    {
        using var conn = _factory.CreateConnection();
        var query = @"
            INSERT INTO ItensPedido (CodPedido, CodProduto, Quantidade, PrecoUnitario)
            VALUES (@CodPedido, @CodProduto, @Quantidade, @PrecoUnitario)
        ";

        await conn.ExecuteAsync(query, new
        {
            CodPedido = codPedido,
            CodProduto = item.CodProduto,
            Quantidade = item.Quantidade,
            PrecoUnitario = item.PrecoUnitario
        });
    }

    public async Task UpdateValorTotalAsync(int codPedido)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"
            UPDATE Pedido
            SET ValorTotal = (
                SELECT ISNULL(SUM(Quantidade * PrecoUnitario), 0)
                FROM ItensPedido
                WHERE CodPedido = @CodPedido
            )
            WHERE CodPedido = @CodPedido
        ";

        await conn.ExecuteAsync(query, new { CodPedido = codPedido });
    }

    public async Task RemoveItemAsync(int codPedido, int codProduto)
    {
        using var conn = _factory.CreateConnection();
        var query = @$"DELETE FROM ItensPedido WHERE CodPedido = @CodPedido AND CodProduto = @CodProduto";

        await conn.ExecuteAsync(query, new { CodPedido = codPedido, CodProduto = codProduto });
    }
}
