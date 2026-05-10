using LojaFullStack.API.DTOs;
using LojaFullStack.API.Models;

namespace LojaFullStack.API.Repositories.Interfaces;

public interface IPedidoRepository
{
    Task<IEnumerable<PedidoResponseDto>> GetAllAsync(DateTime? dataInicio, DateTime? dataFim, string? cnpj);
    Task<PedidoResponseDto?> GetByIdAsync(int id);
    Task<int> CreateAsync(int codCliente);
    Task AddItemAsync(int codPedido, ItensPedido item);
    Task RemoveItemAsync(int codPedido, int codProduto);
    Task UpdateValorTotalAsync(int codPedido);
}
