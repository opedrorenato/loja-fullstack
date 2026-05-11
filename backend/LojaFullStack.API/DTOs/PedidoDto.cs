namespace LojaFullStack.API.DTOs;

public class PedidoRequestDto
{
    public string CNPJ { get; set; } = null!;
    public List<ItensPedidoRequestDto> Itens { get; set; } = new();
}

public class PedidoResponseDto
{
    public int CodPedido { get; set; }
    public int CodCliente { get; set; }
    public string NomeCliente { get; set; } = null!;
    public string CNPJCliente { get; set; } = null!;
    public DateTime DataPedido { get; set; }
    public decimal ValorTotal { get; set; }
    public List<ItensPedidoResponseDto> Itens { get; set; } = [];
}
