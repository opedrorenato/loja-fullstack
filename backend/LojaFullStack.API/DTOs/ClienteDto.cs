namespace LojaFullStack.API.DTOs;

public class ClienteRequestDto
{
    public string CNPJ { get; set; } = null!;
    public string Nome { get; set; } = null!;
    public string Email { get; set; } = null!;
}

public class ClienteResponseDto
{
    public int CodCliente { get; set; }
    public string CNPJ { get; set; } = null!;
    public string Nome { get; set; } = null!;
    public string Email { get; set; } = null!;
    public DateTime DataCadastro { get; set; }
}
