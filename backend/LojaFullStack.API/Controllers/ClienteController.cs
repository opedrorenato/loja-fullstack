using FluentValidation;
using LojaFullStack.API.DTOs;
using LojaFullStack.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LojaFullStack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClienteController : ControllerBase
{
    private readonly IClienteService _clienteService;

    public ClienteController(IClienteService clienteService)
    {
        _clienteService = clienteService;
    }

    /// <summary>
    /// Lista todos os clientes cadastrados
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var clientes = await _clienteService.GetAllAsync();
        return Ok(clientes);
    }

    /// <summary>
    /// Busca um cliente pelo ID
    /// </summary>
    [HttpGet("id/{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cliente = await _clienteService.GetByIdAsync(id);

        if (cliente is null)
            return NotFound("Cliente não encontrado.");

        return Ok(cliente);
    }

    /// <summary>
    /// Busca um cliente pelo CNPJ
    /// </summary>
    [HttpGet("cnpj/{cnpj}")]
    public async Task<IActionResult> GetByCNPJ(string cnpj)
    {
        var cliente = await _clienteService.GetByCNPJAsync(cnpj);

        if (cliente is null)
            return NotFound("Cliente não encontrado.");

        return Ok(cliente);
    }

    /// <summary>
    /// Cadastra um novo cliente
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(ClienteRequestDto dto)
    {
        try
        {
            var cliente = await _clienteService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = cliente.CodCliente }, cliente);
        }
        catch (ValidationException ex)
        {
            var errors = ex.Errors.Select(e => e.ErrorMessage);
            return BadRequest(new { Errors = errors });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    /// <summary>
    /// Atualiza os dados de um cliente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ClienteRequestDto dto)
    {
        try
        {
            await _clienteService.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Remove um cliente com o ID especificado
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _clienteService.DeleteAsync(id);
        return NoContent();
    }
}
