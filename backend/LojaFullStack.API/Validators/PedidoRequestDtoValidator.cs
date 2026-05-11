using FluentValidation;
using LojaFullStack.API.DTOs;
using LojaFullStack.API.Infrastructure;

namespace LojaFullStack.API.Validators;

public partial class PedidoRequestDtoValidator : AbstractValidator<PedidoRequestDto>
{
    public PedidoRequestDtoValidator()
    {
        RuleFor(x => x.CNPJ)
            .NotEmpty()
                .WithMessage("CNPJ é obrigatório.")
            .Must(Utils.BeAValidCnpj)
                .WithMessage("CNPJ inválido. Deve conter 14 dígitos.");

        RuleFor(x => x.Itens)
            .NotEmpty()
                .WithMessage("O pedido deve conter pelo menos um item.");

        RuleForEach(x => x.Itens)
            .SetValidator(new ItensPedidoRequestDtoValidator());
    }
}
