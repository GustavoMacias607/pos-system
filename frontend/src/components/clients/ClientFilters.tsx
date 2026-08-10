type ClientFiltersProps = {
    searchTerm: string;
    statusFilter: "ALL" | "ACTIVE" | "INACTIVE";
    onSearchChange: (value: string) => void;
    onStatusChange: (value: "ALL" | "ACTIVE" | "INACTIVE") => void;
    onClear: () => void;
};

function ClientFilters({
    searchTerm,
    statusFilter,
    onSearchChange,
    onStatusChange,
    onClear,
}: ClientFiltersProps) {
    return (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px_auto] md:items-end">
                <div>
                    <label
                        htmlFor="client-search"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Buscar
                    </label>

                    <input
                        id="client-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Nombre, correo, teléfono o dirección"
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                <div>
                    <label
                        htmlFor="client-status-filter"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Estado
                    </label>

                    <select
                        id="client-status-filter"
                        value={statusFilter}
                        onChange={(event) =>
                            onStatusChange(
                                event.target.value as "ALL" | "ACTIVE" | "INACTIVE"
                            )
                        }
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="ALL">Todos</option>
                        <option value="ACTIVE">Activos</option>
                        <option value="INACTIVE">Inactivos</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={onClear}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    Limpiar filtros
                </button>
            </div>
        </div>
    );
}

export default ClientFilters;
