import { NavLink } from "react-router-dom";

const navigationItems = [
    { label: "Dashboard", to: "/" },
    { label: "Productos", to: "/products" },
    { label: "Categorías", to: "/categories" },
    { label: "Inventario", to: "/inventory" },
    { label: "Ventas", to: "/sales" },
    { label: "Clientes", to: "/clients" },
    { label: "Proveedores", to: "/suppliers" },
    { label: "Usuarios", to: "/users" },
];


function Sidebar() {
    return (
        <aside className="min-h-screen w-64 bg-slate-900 p-6 text-white">
            <div className="text-2xl font-bold mb-6">POS System</div>
            <nav aria-label="Navegación principal" className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        className={({ isActive }) =>
                            isActive
                                ? "w-full rounded-lg bg-slate-800 px-3 py-2 text-left font-medium text-white"
                                : "w-full rounded-lg px-3 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white"
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside >
    );
}

export default Sidebar;
