function Header() {
    return (
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <h1 className="text-xl font-semibold text-slate-900">
                Dashboard
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
