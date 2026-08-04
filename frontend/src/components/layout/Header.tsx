import { useLocation } from "react-router-dom";

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
    const pageTitle = pageTitles[location.pathname] ?? "POS System";
    return (
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <h1 className="text-xl font-semibold text-slate-900">
                {pageTitle}
            </h1>

            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                    Administrador
                </span>

                <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
                >
                    Cerrar sesión
                </button>
            </div>
        </header>
    );
}

export default Header;
