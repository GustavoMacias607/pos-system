import { getAuthSession } from "./auth-storage.service";

import type { ApiErrorResponse } from "../types/api";
import type { ClientMutationResponse, ClientsResponse, CreateClientRequest } from "../types/client";


export async function getClients(): Promise<ClientsResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch("/api/clients", {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as ClientsResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}


export async function createClient(clientData: CreateClientRequest): Promise<ClientMutationResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
    });

    const result = (await response.json()) as ClientMutationResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}
