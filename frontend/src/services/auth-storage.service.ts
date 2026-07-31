import type { AuthenticatedLoginData } from "../types/auth";

const AUTH_SESSION_KEY = "pos.auth.session";

export function saveAuthSession(session: AuthenticatedLoginData): void {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthenticatedLoginData | null {
    const storedSession = sessionStorage.getItem(AUTH_SESSION_KEY);

    if (!storedSession) {
        return null;
    }

    return JSON.parse(storedSession) as AuthenticatedLoginData;
}

export function clearAuthSession(): void {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
}
