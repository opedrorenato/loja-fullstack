namespace LojaFullStack.API.Models;

public class Produto
{
    public int CodProduto { get; set; }
    public string Nome { get; set; } = null!;
    public decimal Preco { get; set; }
    public int Estoque { get; set; }
}
