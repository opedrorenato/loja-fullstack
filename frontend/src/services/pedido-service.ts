import { api } from "./api";
import { PedidoRequest, PedidoResponse, PedidoFiltros, ItensPedidoRequest } from "@/types";

export const pedidoService = {
    getAll: (filtros?: PedidoFiltros) => {
        const params = new URLSearchParams();
        if (filtros?.dataInicio) params.append("dataInicio", filtros.dataInicio);
        if (filtros?.dataFim) params.append("dataFim", filtros.dataFim);
        if (filtros?.cnpj) params.append("cnpj", filtros.cnpj);

        const query = params.toString();
        return api.get<PedidoResponse[]>(`/api/Pedido${query ? `?${query}` : ""}`);
    },

    getById: (id: number) =>
        api.get<PedidoResponse>(`/api/Pedido/${id}`),

    create: (data: PedidoRequest) =>
        api.post<PedidoResponse>("/api/Pedido", data),

    addItem: (codPedido: number, data: ItensPedidoRequest) =>
        api.post<PedidoResponse>(`/api/Pedido/${codPedido}/itens`, data),

    removeItem: (codPedido: number, codProduto: number) =>
        api.delete<void>(`/api/Pedido/${codPedido}/itens/${codProduto}`),
};
