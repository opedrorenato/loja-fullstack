using LojaFullStack.API.DTOs;

namespace LojaFullStack.API.Services.Interfaces;

public interface IPedidoService
{
    Task<IEnumerable<PedidoResponseDto>> GetAllAsync(DateTime? dataInicio, DateTime? dataFim, string? cnpj);
    Task<PedidoResponseDto?> GetByIdAsync(int id);
    Task<PedidoResponseDto> CreateAsync(PedidoRequestDto dto);
    Task<PedidoResponseDto> AddItemAsync(int codPedido, ItensPedidoRequestDto dto);
    Task RemoveItemAsync(int codPedido, int codProduto);
}
