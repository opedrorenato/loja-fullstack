using LojaFullStack.API.DTOs;
using LojaFullStack.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LojaFullStack.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProdutoController : ControllerBase
{
    private readonly IProdutoService _produtoService;

    public ProdutoController(IProdutoService produtoService)
    {
        _produtoService = produtoService;
    }

    /// <summary>
    /// Lista todos os produtos disponíveis
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var produtos = await _produtoService.GetAllAsync();
        return Ok(produtos);
    }

    /// <summary>
    /// Busca um produto pelo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var produto = await _produtoService.GetByIdAsync(id);

        if (produto is null)
            return NotFound("Produto não encontrado.");

        return Ok(produto);
    }

    /// <summary>
    /// Cadastra um novo produto
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(ProdutoRequestDto dto)
    {
        var produto = await _produtoService.CreateAsync(dto);
        var result = CreatedAtAction(nameof(GetById), new { id = produto.CodProduto }, produto);
        return result;
    }

    /// <summary>
    /// Atualiza o estoque de um produto
    /// </summary>
    [HttpPatch("{id}/estoque")]
    public async Task<IActionResult> UpdateEstoque(int id, [FromBody] int novoEstoque)
    {
        await _produtoService.UpdateEstoqueAsync(id, novoEstoque);
        return NoContent();
    }

    /// <summary>
    /// Remove o produto com o ID especificado
    /// </summary>
    [HttpDelete]
    public async Task<IActionResult> Delete(int id)
    {
        await _produtoService.DeleteAsync(id);
        return NoContent();
    }
}
