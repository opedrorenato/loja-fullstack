using FluentValidation;
using LojaFullStack.API.DTOs;
using LojaFullStack.API.Models;
using LojaFullStack.API.Repositories.Interfaces;
using LojaFullStack.API.Services.Interfaces;

namespace LojaFullStack.API.Services;

public class PedidoService : IPedidoService
{
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IClienteRepository _clienteRepository;
    private readonly IProdutoRepository _produtoRepository;
    private readonly IValidator<PedidoRequestDto> _pedidoValidator;
    private readonly IValidator<ItensPedidoRequestDto> _itensPedidoValidator;


    public PedidoService(
        IPedidoRepository pedidoRepository,
        IClienteRepository clienteRepository,
        IProdutoRepository produtoRepository,
        IValidator<PedidoRequestDto> pedidoValidator,
        IValidator<ItensPedidoRequestDto> itensPedidoValidator
    )
    {
        _pedidoRepository = pedidoRepository;
        _clienteRepository = clienteRepository;
        _produtoRepository = produtoRepository;
        _pedidoValidator = pedidoValidator;
        _itensPedidoValidator = itensPedidoValidator;
    }

    public async Task<IEnumerable<PedidoResponseDto>> GetAllAsync(DateTime? dataInicio, DateTime? dataFim, string? cnpj)
    {
        var result = await _pedidoRepository.GetAllAsync(dataInicio, dataFim, cnpj);
        return result.OrderBy(x => x.CodPedido);
    }

    public async Task<PedidoResponseDto?> GetByIdAsync(int id)
    {
        var result = await _pedidoRepository.GetByIdAsync(id);
        return result;
    }

    public async Task<PedidoResponseDto> CreateAsync(PedidoRequestDto dto)
    {
        // Validar Pedido
        var validationResult = await _pedidoValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        // Busca cliente pelo CNPJ informado
        var cliente = await _clienteRepository.GetByCNPJAsync(dto.CNPJ);
        if (cliente is null)
            throw new KeyNotFoundException("Nenhum cliente encontrado com esse CNPJ.");

        var produtos = new List<(ItensPedidoRequestDto Item, Produto Produto)>();
        foreach (var itemDto in dto.Itens)
        {
            var produto = await _produtoRepository.GetByIdAsync(itemDto.CodProduto);

            if (produto is null)
                throw new KeyNotFoundException($"Produto {itemDto.CodProduto} não encontrado.");

            // Validar Estoque disponível para cada item
            if (produto.Estoque < itemDto.Quantidade)
                throw new InvalidOperationException(
                    $"Estoque insuficiente para '{produto.Nome}'. Disponível: {produto.Estoque} unidades.");

            produtos.Add((itemDto, produto));
        }

        var codPedido = await _pedidoRepository.CreateAsync(cliente.CodCliente);

        foreach (var (itemDto, produto) in produtos)
        {
            var item = new ItensPedido
            {
                CodProduto = itemDto.CodProduto,
                Quantidade = itemDto.Quantidade,
                PrecoUnitario = produto!.Preco
            };

            await _pedidoRepository.AddItemAsync(codPedido, item);
            await _produtoRepository.UpdateEstoqueAsync(produto.CodProduto, produto.Estoque - itemDto.Quantidade);
        }

        await _pedidoRepository.UpdateValorTotalAsync(codPedido);
        var result = (await _pedidoRepository.GetByIdAsync(codPedido))!;
        return result;
    }

    public async Task<PedidoResponseDto> AddItemAsync(int codPedido, ItensPedidoRequestDto dto)
    {
        // Validar Item do Pedido
        var validationResult = await _itensPedidoValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        // Verifica se o pedido existe
        var pedido = await _pedidoRepository.GetByIdAsync(codPedido);
        if (pedido is null)
            throw new KeyNotFoundException("Pedido não encontrado.");

        // Verifica se o produto existe
        var produto = await _produtoRepository.GetByIdAsync(dto.CodProduto);
        if (produto is null)
            throw new KeyNotFoundException("Produto não encontrado.");

        // Regra de negócio: verifica estoque disponível
        if (produto.Estoque < dto.Quantidade)
            throw new InvalidOperationException(
                $"Estoque insuficiente. Disponível: {produto.Estoque} unidade(s).");

        // Adiciona o item com o preço atual do produto
        var item = new ItensPedido
        {
            CodProduto = dto.CodProduto,
            Quantidade = dto.Quantidade,
            PrecoUnitario = produto.Preco
        };

        await _pedidoRepository.AddItemAsync(codPedido, item);

        // Desconta o estoque
        await _produtoRepository.UpdateEstoqueAsync(produto.CodProduto, produto.Estoque - dto.Quantidade);

        // Recalcula o valor total do pedido
        await _pedidoRepository.UpdateValorTotalAsync(codPedido);

        return (await _pedidoRepository.GetByIdAsync(codPedido))!;
    }

    public async Task RemoveItemAsync(int codPedido, int codProduto)
    {
        // Verifica se o pedido existe
        var pedido = await _pedidoRepository.GetByIdAsync(codPedido);
        if (pedido is null)
            throw new KeyNotFoundException("Pedido não encontrado.");

        // Busca o item para saber a quantidade a devolver ao estoque
        var item = pedido.Itens.FirstOrDefault(i => i.CodProduto == codProduto);
        if (item is null)
            throw new KeyNotFoundException("Item não encontrado no pedido.");

        // Remove o item
        await _pedidoRepository.RemoveItemAsync(codPedido, codProduto);

        // Devolve a quantidade ao estoque
        var produto = await _produtoRepository.GetByIdAsync(codProduto);
        await _produtoRepository.UpdateEstoqueAsync(codProduto, produto!.Estoque + item.Quantidade);

        // Recalcula o valor total
        await _pedidoRepository.UpdateValorTotalAsync(codPedido);
    }
}
