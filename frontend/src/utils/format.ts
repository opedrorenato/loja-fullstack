export const formatarData = (data: string | Date) => {
    return new Date(data).toLocaleDateString("pt-BR");
};

export const formatarCnpj = (cnpj: string) => {
    return cnpj.replace(/\D/g, "")
        .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

export const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
