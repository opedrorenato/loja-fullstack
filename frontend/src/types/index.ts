// Cliente
export interface ClienteRequest {
    cnpj: string;
    nome: string;
    email: string;
}

export interface ClienteResponse {
    codCliente: number;
    cnpj: string;
    nome: string;
    email: string;
    dataCadastro: string;
}

// Produto
export interface ProdutoRequest {
    nome: string;
    preco: number;
    estoque: number;
}

export interface ProdutoResponse {
    codProduto: number;
    nome: string;
    preco: number;
    estoque: number;
}

// Itens do Pedido
export interface ItensPedidoRequest {
    codProduto: number;
    quantidade: number;
}

export interface ItensPedidoResponse {
    codPedido: number;
    codProduto: number;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
}

// Pedido
export interface PedidoRequest {
    cnpj: string;
}

export interface PedidoResponse {
    codPedido: number;
    codCliente: number;
    nomeCliente: string;
    cnpjCliente: string;
    dataPedido: string;
    valorTotal: number;
    itens: ItensPedidoResponse[];
}

// Filtros
export interface PedidoFiltros {
    dataInicio?: string;
    dataFim?: string;
    cnpj?: string;
}
