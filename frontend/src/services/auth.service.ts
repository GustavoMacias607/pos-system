import type {
    ApiErrorResponse,
    LoginCredentials,
    LoginResponse,
} from "../types/auth";

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    const result = (await response.json()) as LoginResponse | ApiErrorResponse;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
}
