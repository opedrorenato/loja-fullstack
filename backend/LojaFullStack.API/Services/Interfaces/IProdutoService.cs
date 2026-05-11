using LojaFullStack.API.DTOs;

namespace LojaFullStack.API.Services.Interfaces;

public interface IProdutoService
{
    Task<IEnumerable<ProdutoResponseDto>> GetAllAsync();
    Task<ProdutoResponseDto?> GetByIdAsync(int id);
    Task<ProdutoResponseDto> CreateAsync(ProdutoRequestDto dto);
    Task DeleteAsync(int codProduto);
}
