import { api } from "./api";
import { ClienteRequest, ClienteResponse } from "@/types";

export const clienteService = {
    getAll: () =>
        api.get<ClienteResponse[]>("/api/Cliente"),

    getById: (id: number) =>
        api.get<ClienteResponse>(`/api/Cliente/id/${id}`),

    getByCnpj: (cnpj: string) => {
        const cnpjLimpo = cnpj.replace(/\D/g, "");
        return api.get<ClienteResponse>(`/api/Cliente/cnpj/${encodeURIComponent(cnpjLimpo)}`);
    },

    create: (data: ClienteRequest) =>
        api.post<ClienteResponse>("/api/Cliente", data),

    update: (id: number, data: ClienteRequest) =>
        api.put(`/api/Cliente/${id}`, data),

    delete: (id: number) =>
        api.delete(`/api/Cliente/${id}`),
};
