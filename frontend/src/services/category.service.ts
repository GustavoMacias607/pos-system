import { getAuthSession } from "./auth-storage.service";
import type { ApiErrorResponse } from "../types/api";
import type {
    CategoriesResponse,
    CategoryResponse,
    CategoryStatusResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from "../types/category";

export async function getCategories(): Promise<CategoriesResponse> {
    const session = getAuthSession();
    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch("/api/categories", {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as CategoriesResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function createCategory(categoryData: CreateCategoryRequest): Promise<CategoryResponse> {
    const session = getAuthSession();
    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
    });

    const result = (await response.json()) as CategoryResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function updateCategory(categoryId: number, categoryData: UpdateCategoryRequest): Promise<CategoryResponse> {
    const session = getAuthSession();
    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
    });

    const result = (await response.json()) as CategoryResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function deactivateCategory(categoryId: number): Promise<CategoryStatusResponse> {
    const session = getAuthSession();
    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as CategoryStatusResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}

export async function activateCategory(categoryId: number): Promise<CategoryStatusResponse> {
    const session = getAuthSession();
    if (!session) {
        throw new Error("No hay una sesión activa");
    }

    const response = await fetch(`/api/categories/${categoryId}/activate`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    const result = (await response.json()) as CategoryStatusResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}
