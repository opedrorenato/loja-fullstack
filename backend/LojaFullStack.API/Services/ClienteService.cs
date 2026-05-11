using FluentValidation;
using LojaFullStack.API.DTOs;
using LojaFullStack.API.Infrastructure;
using LojaFullStack.API.Models;
using LojaFullStack.API.Repositories.Interfaces;
using LojaFullStack.API.Services.Interfaces;

namespace LojaFullStack.API.Services;

public class ClienteService : IClienteService
{
    private readonly IClienteRepository _clienteRepository;
    private readonly IValidator<ClienteRequestDto> _validator;

    public ClienteService(
        IClienteRepository clienteRepository,
        IValidator<ClienteRequestDto> validator
    )
    {
        _clienteRepository = clienteRepository;
        _validator = validator;
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
        var cnpjLimpo = Utils.LimparCnpj(cnpj);
        var cliente = await _clienteRepository.GetByCNPJAsync(cnpjLimpo);

        if (cliente is null)
            return null;

        var result = ToResponseDto(cliente);
        return result;
    }

    public async Task<ClienteResponseDto> CreateAsync(ClienteRequestDto dto)
    {
        // Padronizar CNPJ (apenas números)
        dto.CNPJ = Utils.LimparCnpj(dto.CNPJ);

        // Validar Cliente
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        // Verificar se CNPJ já está cadastrado
        var existente = await _clienteRepository.GetByCNPJAsync(dto.CNPJ);
        if (existente is not null)
            throw new InvalidOperationException("Já existe um cliente cadastrado com esse CNPJ.");

        var cliente = new Cliente(dto.CNPJ, dto.Nome, dto.Email);

        var id = await _clienteRepository.CreateAsync(cliente);
        var criado = await _clienteRepository.GetByIdAsync(id);

        return ToResponseDto(criado!);
    }

    public async Task UpdateAsync(int id, ClienteRequestDto dto)
    {
        var cliente = await _clienteRepository.GetByIdAsync(id);
        if (cliente is null)
            throw new InvalidOperationException("Cliente não encontrado.");

        cliente.Nome = dto.Nome;
        cliente.Email = dto.Email;

        await _clienteRepository.UpdateAsync(cliente);
    }

    public async Task DeleteAsync(int id)
    {
        await _clienteRepository.DeleteAsync(id);
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
