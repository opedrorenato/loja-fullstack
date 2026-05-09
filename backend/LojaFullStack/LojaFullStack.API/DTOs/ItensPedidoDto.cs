namespace LojaFullStack.API.DTOs;

public class ItensPedidoRequestDto
{
    public int CodProduto { get; set; }
    public int Quantidade { get; set; }
}

public class ItensPedidoResponseDto
{
    public int CodProduto { get; set; }
    public string NomeProduto { get; set; } = null!;
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
    public decimal Subtotal => Quantidade * PrecoUnitario;
}
