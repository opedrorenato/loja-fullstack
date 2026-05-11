using FluentValidation;
using LojaFullStack.API.DTOs;
using LojaFullStack.API.Infrastructure;

namespace LojaFullStack.API.Validators;

public partial class ClienteRequestDtoValidator : AbstractValidator<ClienteRequestDto>
{
    public ClienteRequestDtoValidator()
    {
        RuleFor(x => x.CNPJ)
            .NotEmpty()
                .WithMessage("CNPJ é obrigatório.")
            .Must(Utils.BeAValidCnpj)
                .WithMessage("CNPJ inválido. Deve conter 14 dígitos.");

        RuleFor(x => x.Nome)
            .NotEmpty()
                .WithMessage("Nome é obrigatório.");

        RuleFor(x => x.Email)
            .NotEmpty()
                .WithMessage("Email é obrigatório.")
            .EmailAddress()
                .WithMessage("Email em formato inválido.");
    }
}
