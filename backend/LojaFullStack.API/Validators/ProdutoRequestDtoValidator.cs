using FluentValidation;
using LojaFullStack.API.DTOs;

namespace LojaFullStack.API.Validators;

public class ProdutoRequestDtoValidator : AbstractValidator<ProdutoRequestDto>
{
    public ProdutoRequestDtoValidator()
    {
        RuleFor(x => x.Preco)
            .GreaterThanOrEqualTo(0)
                .WithMessage("O preço deve ser positivo ou zero");

        RuleFor(x => x.Estoque)
            .GreaterThanOrEqualTo(0)
                .WithMessage("Deve ser informada um valor positivo ou zero")
            .Must(e => e == Math.Truncate((decimal)e))
                .WithMessage("Estoque deve ser um número inteiro");
    }
}
