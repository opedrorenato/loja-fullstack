using LojaFullStack.API.DTOs;
using LojaFullStack.API.Models;
using LojaFullStack.API.Repositories.Interfaces;
using LojaFullStack.API.Services.Interfaces;

namespace LojaFullStack.API.Services;

public class ClienteService : IClienteService
{
    private readonly IClienteRepository _clienteRepository;

    public ClienteService(IClienteRepository clienteRepository)
    {
        _clienteRepository = clienteRepository;
    }

    public async Task<IEnumerable<ClienteResponseDto>> GetAllAsync()
    {
        var clientes = await _clienteRepository.GetAllAsync();
        var result = clientes.Select(ToResponseDto);
        return result.OrderBy(x => x.CodCliente);
    }

    public async Task<ClienteResponseDto?> GetByIdAsync(int id)
    {
        var cliente = await _clienteRepository.GetByIdAsync(id);

        if (cliente is null)
            return null;

        var result = ToResponseDto(cliente);
        return result;
    }

    public async Task<ClienteResponseDto?> GetByCNPJAsync(string cnpj)
    {
        var cliente = await _clienteRepository.GetByCNPJAsync(cnpj);

        if (cliente is null)
            return null;

        var result = ToResponseDto(cliente);
        return result;
    }

    public async Task<ClienteResponseDto> CreateAsync(ClienteRequestDto dto)
    {
        // Verificar se CNPJ já está cadastrado
        var existente = await _clienteRepository.GetByCNPJAsync(dto.CNPJ);
        if (existente is not null)
            throw new InvalidOperationException("Já existe um cliente cadastrado com esse CNPJ.");

        var cliente = new Cliente
        {
            CNPJ = dto.CNPJ,
            Nome = dto.Nome,
            Email = dto.Email
        };

        var id = await _clienteRepository.CreateAsync(cliente);
        var criado = await _clienteRepository.GetByIdAsync(id);
        return ToResponseDto(criado!);
    }

    #region Utils

    private static ClienteResponseDto ToResponseDto(Cliente c) => new()
    {
        CodCliente = c.CodCliente,
        CNPJ = c.CNPJ,
        Nome = c.Nome,
        Email = c.Email,
        DataCadastro = c.DataCadastro
    };

    #endregion
}
