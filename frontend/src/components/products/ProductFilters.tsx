type ProductStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

type ProductCategoryOption = {
    id: number;
    name: string;
    active: boolean | null;
};

type ProductFiltersProps = {
    searchTerm: string;
    statusFilter: ProductStatusFilter;
    categoryFilter: string;
    categoryOptions: ProductCategoryOption[];
    onSearchChange: (value: string) => void;
    onStatusChange: (value: ProductStatusFilter) => void;
    onCategoryChange: (value: string) => void;
    onClear: () => void;
};

function ProductFilters({
    searchTerm,
    statusFilter,
    categoryFilter,
    categoryOptions,
    onSearchChange,
    onStatusChange,
    onCategoryChange,
    onClear,
}: ProductFiltersProps) {
    const hasActiveFilters =
        searchTerm.trim() !== "" ||
        statusFilter !== "ALL" ||
        categoryFilter !== "ALL";

    return (
        <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div>
                    <label
                        htmlFor="product-search"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Buscar productos
                    </label>

                    <input
                        id="product-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        placeholder="Nombre, descripción o categoría"
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="product-status-filter"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Estado
                    </label>

                    <select
                        id="product-status-filter"
                        value={statusFilter}
                        onChange={(event) =>
                            onStatusChange(
                                event.target.value as ProductStatusFilter
                            )
                        }
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="ACTIVE">Activos</option>
                        <option value="INACTIVE">Inactivos</option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="product-category-filter"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Categoría
                    </label>

                    <select
                        id="product-category-filter"
                        value={categoryFilter}
                        onChange={(event) =>
                            onCategoryChange(event.target.value)
                        }
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="ALL">
                            Todas las categorías
                        </option>

                        <option value="NONE">
                            Sin categoría
                        </option>

                        {categoryOptions.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                                {category.active === false
                                    ? " (inactiva)"
                                    : ""}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-3 rounded-2xl bg-white p-2 text-sm font-semibold text-blue-600 hover:bg-slate-300 hover:text-blue-800"
                >
                    Limpiar búsqueda y filtros
                </button>
            )}
        </>
    );
}

export default ProductFilters;
