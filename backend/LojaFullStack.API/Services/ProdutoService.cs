using LojaFullStack.API.DTOs;
using LojaFullStack.API.Models;
using LojaFullStack.API.Repositories.Interfaces;
using LojaFullStack.API.Services.Interfaces;

namespace LojaFullStack.API.Services;

public class ProdutoService : IProdutoService
{
    private readonly IProdutoRepository _produtoRepository;

    public ProdutoService(IProdutoRepository produtoRepository)
    {
        _produtoRepository = produtoRepository;
    }

    public async Task<IEnumerable<ProdutoResponseDto>> GetAllAsync()
    {
        var produtos = await _produtoRepository.GetAllAsync();
        var result = produtos.Select(ToResponseDto).OrderBy(x => x.CodProduto); ;
        return result;
    }

    public async Task<ProdutoResponseDto?> GetByIdAsync(int id)
    {
        var produto = await _produtoRepository.GetByIdAsync(id);
        return produto is null ? null : ToResponseDto(produto);
    }

    public async Task<ProdutoResponseDto> CreateAsync(ProdutoRequestDto dto)
    {
        var produto = new Produto
        {
            Nome = dto.Nome,
            Preco = dto.Preco,
            Estoque = dto.Estoque
        };

        var id = await _produtoRepository.CreateAsync(produto);
        var criado = await _produtoRepository.GetByIdAsync(id);
        return ToResponseDto(criado!);
    }

    public async Task UpdateEstoqueAsync(int id, int novoEstoque)
    {
        await _produtoRepository.UpdateEstoqueAsync(id, novoEstoque);
    }

    public async Task DeleteAsync(int codProduto)
    {
        await _produtoRepository.DeleteAsync(codProduto);
    }

    // Utils
    private static ProdutoResponseDto ToResponseDto(Produto p) => new()
    {
        CodProduto = p.CodProduto,
        Nome = p.Nome,
        Preco = p.Preco,
        Estoque = p.Estoque
    };
}
