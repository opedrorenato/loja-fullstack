using LojaFullStack.API.DTOs;
using LojaFullStack.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LojaFullStack.API.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ProdutoController : ControllerBase
    {
        private readonly IProdutoService _produtoService;

        public ProdutoController(IProdutoService produtoService)
        {
            _produtoService = produtoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var produtos = await _produtoService.GetAllAsync();
            return Ok(produtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var produto = await _produtoService.GetByIdAsync(id);
            if (produto is null) return NotFound("Produto não encontrado.");
            return Ok(produto);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ProdutoRequestDto dto)
        {
            var produto = await _produtoService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = produto.CodProduto }, produto);
        }
    }
}
