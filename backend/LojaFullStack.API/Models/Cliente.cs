namespace LojaFullStack.API.Models;

public class Cliente
{
    public int CodCliente { get; set; }
    public string CNPJ { get; set; } = null!;
    public string Nome { get; set; } = null!;
    public string Email { get; set; } = null!;
    public DateTime DataCadastro { get; set; }

    public Cliente(string cnpj, string nome, string email)
    {
        CNPJ = cnpj;
        Nome = nome;
        Email = email;
    }

    public Cliente()
    {
        
    }
}
