import { api } from "./api";
import { ProdutoRequest, ProdutoResponse } from "@/types";

export const produtoService = {
    getAll: () =>
        api.get<ProdutoResponse[]>("/api/Produto"),

    getById: (id: number) =>
        api.get<ProdutoResponse>(`/api/Produto/${id}`),

    create: (data: ProdutoRequest) =>
        api.post<ProdutoResponse>("/api/Produto", data),

    updateEstoque: (id: number, estoque: number) =>
        api.patch(`/api/Produto/${id}/estoque`, estoque),

    delete: (id: number) =>
        api.delete(`/api/Produto/${id}`),
};
