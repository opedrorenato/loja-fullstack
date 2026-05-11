using LojaFullStack.API.DTOs;

namespace LojaFullStack.API.Services.Interfaces;

public interface IProdutoService
{
    Task<IEnumerable<ProdutoResponseDto>> GetAllAsync();
    Task<ProdutoResponseDto?> GetByIdAsync(int id);
    Task<ProdutoResponseDto> CreateAsync(ProdutoRequestDto dto);
    Task UpdateEstoqueAsync(int id, int novoEstoque);
    Task UpdateAsync(int id, ProdutoRequestDto dto);
    Task DeleteAsync(int codProduto);
}
