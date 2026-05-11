using LojaFullStack.API.Models;

namespace LojaFullStack.API.Repositories.Interfaces;

public interface IClienteRepository
{
    Task<IEnumerable<Cliente>> GetAllAsync();
    Task<Cliente?> GetByIdAsync(int id);
    Task<Cliente?> GetByCNPJAsync(string cnpj);

    Task<int> CreateAsync(Cliente cliente);
    Task UpdateAsync(Cliente cliente);
    Task DeleteAsync(int id);
}
