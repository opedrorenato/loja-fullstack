using LojaFullStack.API.DTOs;
using LojaFullStack.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LojaFullStack.API.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class PedidoController : ControllerBase
{
    private readonly IPedidoService _pedidoService;

    public PedidoController(IPedidoService pedidoService)
    {
        _pedidoService = pedidoService;
    }

    /// <summary>
    /// Lista todos os pedidos com filtros opcionais
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] string? cnpj)
    {
        var pedidos = await _pedidoService.GetAllAsync(dataInicio, dataFim, cnpj);
        return Ok(pedidos);
    }

    /// <summary>
    /// Busca um pedido pelo ID, listando também todos os itens do pedido
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var pedido = await _pedidoService.GetByIdAsync(id);

        if (pedido is null) 
            return NotFound("Pedido não encontrado.");

        return Ok(pedido);
    }

    /// <summary>
    /// Cria um novo pedido para um cliente via CNPJ
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(PedidoRequestDto dto)
    {
        try
        {
            var pedido = await _pedidoService.CreateAsync(dto);
            var result = CreatedAtAction(nameof(GetById), new { id = pedido.CodPedido }, pedido);
            return result;
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Adiciona um item ao pedido
    /// </summary>
    [HttpPost("{id}/itens")]
    public async Task<IActionResult> AddItem(int id, ItensPedidoRequestDto dto)
    {
        try
        {
            var pedido = await _pedidoService.AddItemAsync(id, dto);
            return Ok(pedido);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Remove um item do pedido
    /// </summary>
    [HttpDelete("{id}/itens/{codProduto}")]
    public async Task<IActionResult> RemoveItem(int id, int codProduto)
    {
        try
        {
            await _pedidoService.RemoveItemAsync(id, codProduto);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
