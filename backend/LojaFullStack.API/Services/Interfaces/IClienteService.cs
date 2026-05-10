using LojaFullStack.API.DTOs;

namespace LojaFullStack.API.Services.Interfaces;

public interface IClienteService
{
    Task<IEnumerable<ClienteResponseDto>> GetAllAsync();
    Task<ClienteResponseDto?> GetByIdAsync(int id);
    Task<ClienteResponseDto?> GetByCNPJAsync(string cnpj);
    Task<ClienteResponseDto> CreateAsync(ClienteRequestDto dto);
}
