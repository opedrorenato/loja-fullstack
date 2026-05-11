namespace LojaFullStack.API.Models;

public class Cliente
{
    public int CodCliente { get; set; }
    public string CNPJ { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }
    public DateTime DataCadastro { get; set; }

    public Cliente(string cnpj, string nome, string email)
    {
        CNPJ = cnpj;
        Nome = nome;
        Email = email;
    }
}
