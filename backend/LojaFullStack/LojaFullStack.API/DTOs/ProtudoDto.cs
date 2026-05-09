namespace LojaFullStack.API.DTOs;

public class ProdutoRequestDto
{
    public string Nome { get; set; } = null!;
    public decimal Preco { get; set; }
    public int Estoque { get; set; }
}

public class ProdutoResponseDto
{
    public int CodProduto { get; set; }
    public string Nome { get; set; } = null!;
    public decimal Preco { get; set; }
    public int Estoque { get; set; }
}
