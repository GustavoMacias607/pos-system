import { getAuthSession } from "./auth-storage.service";

import type { ApiErrorResponse } from "../types/api";
import type {
    CreateProductRequest,
    ProductResponse,
    ProductsResponse,
    ProductStatusResponse,
    UpdateProductRequest,
} from "../types/product";

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

export async function createProduct(productData: CreateProductRequest): Promise<ProductResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch("/api/products", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    });

    const result = (await response.json()) as ProductResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function updateProduct(productId: number, productData: UpdateProductRequest): Promise<ProductResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    });

    const result = (await response.json()) as ProductResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function deactivateProduct(productId: number): Promise<ProductStatusResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as ProductStatusResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function activateProduct(productId: number): Promise<ProductStatusResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch(`/api/products/${productId}/activate`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as ProductStatusResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}
