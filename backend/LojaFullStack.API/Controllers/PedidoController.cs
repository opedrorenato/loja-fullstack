using LojaFullStack.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using LojaFullStack.API.Services.Interfaces;

namespace LojaFullStack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        var pedido = await _pedidoService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = pedido.CodPedido }, pedido);
    }

    /// <summary>
    /// Adiciona um item ao pedido
    /// </summary>
    [HttpPost("{id}/itens")]
    public async Task<IActionResult> AddItem(int id, ItensPedidoRequestDto dto)
    {
        var pedido = await _pedidoService.AddItemAsync(id, dto);
        return Ok(pedido);
    }

    /// <summary>
    /// Remove um item do pedido
    /// </summary>
    [HttpDelete("{id}/itens/{codProduto}")]
    public async Task<IActionResult> RemoveItem(int id, int codProduto)
    {
        await _pedidoService.RemoveItemAsync(id, codProduto);
        return NoContent();
    }
}
