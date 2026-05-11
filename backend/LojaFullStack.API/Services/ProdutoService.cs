using FluentValidation;
using LojaFullStack.API.DTOs;
using LojaFullStack.API.Models;
using LojaFullStack.API.Repositories.Interfaces;
using LojaFullStack.API.Services.Interfaces;

namespace LojaFullStack.API.Services;

public class ProdutoService : IProdutoService
{
    private readonly IProdutoRepository _produtoRepository;
    private readonly IValidator<ProdutoRequestDto> _validator;

    public ProdutoService(
        IProdutoRepository produtoRepository,
        IValidator<ProdutoRequestDto> validator
    )
    {
        _produtoRepository = produtoRepository;
        _validator = validator;
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
        // Validar Produto
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);
        
        // Validar Duplicidade
        var produtoExistente = await _produtoRepository.GetByNameAsync(dto.Nome);
        if (produtoExistente != null)
            throw new InvalidOperationException("Já existe um produto cadastrado com este nome.");

        // Criar
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

    public async Task UpdateAsync(int id, ProdutoRequestDto dto)
    {
        // Validar Produto
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var produto = await _produtoRepository.GetByIdAsync(id);
        if (produto is null)
            throw new InvalidOperationException("Produto não encontrado.");

        // Validar Duplicidade
        var produtoExistente = await _produtoRepository.GetByNameAsync(dto.Nome);
        if (produtoExistente != null && produtoExistente.CodProduto != id)
            throw new InvalidOperationException("Já existe um produto cadastrado com este nome.");

        produto.Nome = dto.Nome;
        produto.Preco = dto.Preco;
        produto.Estoque = dto.Estoque;

        await _produtoRepository.UpdateAsync(produto);
    }

    public async Task DeleteAsync(int codProduto)
    {
        var hasItems = await _produtoRepository.HasItemsAsync(codProduto);
        if (hasItems)
            throw new InvalidOperationException("Não é possível excluir o produto pois ele possui pedidos vinculados.");

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
