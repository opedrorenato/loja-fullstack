import { api } from "./api";
import { ClienteRequest, ClienteResponse } from "@/types";

export const clienteService = {
    getAll: () =>
        api.get<ClienteResponse[]>("/api/Cliente"),

    getById: (id: number) =>
        api.get<ClienteResponse>(`/api/Cliente/id/${id}`),

    getByCnpj: (cnpj: string) =>
        api.get<ClienteResponse>(`/api/Cliente/cnpj/${encodeURIComponent(cnpj)}`),

    create: (data: ClienteRequest) =>
        api.post<ClienteResponse>("/api/Cliente", data),
};
