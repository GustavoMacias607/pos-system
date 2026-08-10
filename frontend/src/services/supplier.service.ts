import { getAuthSession } from "./auth-storage.service";

import type { ApiErrorResponse } from "../types/api";
import type {
    CreateSupplierRequest,
    SupplierMutationResponse,
    SuppliersResponse,
    UpdateSupplierRequest,
} from "../types/supplier";

export async function getSuppliers(): Promise<SuppliersResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa.");
    }

    const response = await fetch("/api/suppliers", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as SuppliersResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function createSupplier(
    supplierData: CreateSupplierRequest
): Promise<SupplierMutationResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa.");
    }

    const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
    });

    const result = (await response.json()) as
        | SupplierMutationResponse
        | ApiErrorResponse;

    if (!response.ok || !result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function updateSupplier(
    supplierId: string,
    supplierData: UpdateSupplierRequest
): Promise<SupplierMutationResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa.");
    }

    const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
    });

    const result = (await response.json()) as
        | SupplierMutationResponse
        | ApiErrorResponse;

    if (!response.ok || !result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function deactivateSupplier(
    supplierId: string
): Promise<SupplierMutationResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa.");
    }

    const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as
        | SupplierMutationResponse
        | ApiErrorResponse;

    if (!response.ok || !result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function activateSupplier(
    supplierId: string
): Promise<SupplierMutationResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa.");
    }

    const response = await fetch(`/api/suppliers/${supplierId}/activate`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as
        | SupplierMutationResponse
        | ApiErrorResponse;

    if (!response.ok || !result.success) {
        throw new Error(result.message);
    }

    return result;
}
