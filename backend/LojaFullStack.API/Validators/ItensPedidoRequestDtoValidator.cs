using FluentValidation;
using LojaFullStack.API.DTOs;

namespace LojaFullStack.API.Validators;

public class ItensPedidoRequestDtoValidator : AbstractValidator<ItensPedidoRequestDto>
{
    public ItensPedidoRequestDtoValidator()
    {
        RuleFor(x => x.CodProduto)
            .GreaterThan(0)
                .WithMessage("Deve ser informado um Código de Produto válido");

        RuleFor(x => x.Quantidade)
            .GreaterThan(0)
                .WithMessage("Deve ser informada uma Quantidade Válida");
    }
}
