import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { clearAuthSession, getAuthSession } from "../../services/auth-storage.service";
import { logout } from "../../services/auth.service";

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/products": "Productos",
    "/categories": "Categorías",
    "/inventory": "Inventario",
    "/sales": "Ventas",
    "/clients": "Clientes",
    "/suppliers": "Proveedores",
    "/users": "Usuarios",

};

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const session = getAuthSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (!session) {
            navigate("/login", { replace: true });
            return;
        }

        setIsLoggingOut(true);

        try {
            await logout(session.refreshToken);
        } finally {
            clearAuthSession();
            navigate("/login", { replace: true });
        }
    };

    const pageTitle = pageTitles[location.pathname] ?? "POS System";
    return (
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <h1 className="text-xl font-semibold text-slate-900">
                {pageTitle}
            </h1>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">
                        {session?.user.name}
                    </p>
                    <p className="text-xs text-slate-500">
                        {session?.user.role}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                </button>
            </div>
        </header>
    );
}

export default Header;
