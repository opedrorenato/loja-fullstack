const BASE_URL = "http://localhost:5000";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    body?: unknown
): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const erro = await response.text();
        throw new Error(erro || `Erro ${response.status}`);
    }

    // 204 No Content não tem body
    if (response.status === 204) return undefined as T;

    return response.json();
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, "POST", body),
    delete: <T>(endpoint: string) => request<T>(endpoint, "DELETE"),
};
