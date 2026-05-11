import { api } from "./api";
import { ProdutoRequest, ProdutoResponse } from "@/types";

export const produtoService = {
    getAll: () =>
        api.get<ProdutoResponse[]>("/api/Produto"),

    getById: (id: number) =>
        api.get<ProdutoResponse>(`/api/Produto/${id}`),

    create: (data: ProdutoRequest) =>
        api.post<ProdutoResponse>("/api/Produto", data),

    update: (id: number, data: ProdutoRequest) =>
        api.put(`/api/Produto/${id}`, data),

    delete: (id: number) =>
        api.delete(`/api/Produto/${id}`),
};
