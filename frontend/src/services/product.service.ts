import { getAuthSession } from "./auth-storage.service";

import type { ApiErrorResponse } from "../types/api";
import type { ProductsResponse } from "../types/product";


export async function getProducts(): Promise<ProductsResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch("/api/products", {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as ProductsResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}
