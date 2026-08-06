import { getAuthSession } from "./auth-storage.service";

import type { ApiErrorResponse } from "../types/api";
import type { ClientsResponse } from "../types/client";

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
