const navigationItems = [
    { label: "Dashboard" },
    { label: "Productos" },
    { label: "Categorías" },
    { label: "Inventario" },
    { label: "Ventas" },
    { label: "Clientes" },
    { label: "Proveedores" },
    { label: "Usuarios" },
];


function Sidebar() {
    return (
        <aside className="min-h-screen w-64 bg-slate-900 p-6 text-white">
            <div className="text-2xl font-bold mb-6">POS System</div>
            <nav aria-label="Navegación principal" className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                    <button type="button" key={item.label} className="w-full rounded-lg py-2 px-3 text-left hover:bg-slate-800">
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
