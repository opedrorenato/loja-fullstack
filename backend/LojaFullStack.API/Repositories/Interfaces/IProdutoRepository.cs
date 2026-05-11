using LojaFullStack.API.Models;

namespace LojaFullStack.API.Repositories.Interfaces;

public interface IProdutoRepository
{
    Task<IEnumerable<Produto>> GetAllAsync();
    Task<Produto?> GetByIdAsync(int id);
    Task<int> CreateAsync(Produto produto);
    Task UpdateEstoqueAsync(int codProduto, int novoEstoque);
    Task UpdateAsync(Produto produto);
    Task<bool> HasItemsAsync(int codProduto);
    Task DeleteAsync(int codProduto);
}
