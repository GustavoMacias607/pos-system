import type {
    InventoryMovementsResponse,
    InventoryMovementFilters,
    LowStockProductsResponse,
    InventoryMutationResponse,
    InventoryAdjustmentRequest,
    StockEntryRequest,
    WasteRequest
} from "../types/inventory";

import type { ApiErrorResponse } from "../types/api";

import { getAuthSession } from "./auth-storage.service";

export async function getInventoryMovements(filters?: InventoryMovementFilters): Promise<InventoryMovementsResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const params = new URLSearchParams();

    if (filters?.type) {
        params.set("type", filters.type);
    }

    if (filters?.productId !== undefined) {
        params.set("productId", String(filters.productId));
    }

    const queryString = params.toString();

    const url = queryString
        ? `/api/inventory/movements?${queryString}`
        : "/api/inventory/movements";

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as
        | InventoryMovementsResponse
        | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}


export async function getLowStockProducts(): Promise<LowStockProductsResponse> {
    const session = getAuthSession();
    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch(`/api/inventory/low-stock`, {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });
    const result = (await response.json()) as LowStockProductsResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function createInventoryAdjustment(adjustmentData: InventoryAdjustmentRequest): Promise<InventoryMutationResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch("/api/inventory/adjustment", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(adjustmentData),
    });

    const result = (await response.json()) as
        | InventoryMutationResponse
        | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function createStockEntry(stockEntryData: StockEntryRequest): Promise<InventoryMutationResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch("/api/inventory/stock-entry", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(stockEntryData),
    });

    const result = (await response.json()) as
        | InventoryMutationResponse
        | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function createWaste(wasteData: WasteRequest): Promise<InventoryMutationResponse> {
    const session = getAuthSession();

    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch("/api/inventory/waste", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(wasteData),
    });

    const result = (await response.json()) as
        | InventoryMutationResponse
        | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}
