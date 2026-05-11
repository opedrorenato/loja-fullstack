using System.Text.RegularExpressions;

namespace LojaFullStack.API.Infrastructure;

public static partial class Utils
{
    public static bool BeAValidCnpj(string? cnpj)
    {
        if (string.IsNullOrWhiteSpace(cnpj))
            return false;

        var digits = ValidCnpjRegex().Replace(cnpj, "");
        return digits.Length == 14;
    }

    public static string LimparCnpj(string cnpj) => ValidCnpjRegex().Replace(cnpj, "");

    [GeneratedRegex("\\D")]
    private static partial Regex ValidCnpjRegex();
}
