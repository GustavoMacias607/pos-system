import type { Product } from "../../types/product";


type ProductsTableProps = {
    products: Product[];
    canManageProducts: boolean;
    isSubmitting: boolean;
    updatingStatusProductId: number | null;
    onEdit: (product: Product) => void;
    onToggleStatus: (product: Product) => Promise<void>;
};

const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(Number(price));
};

function ProductsTable({
    products,
    canManageProducts,
    isSubmitting,
    updatingStatusProductId,
    onEdit,
    onToggleStatus,
}: ProductsTableProps) {
    return (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sm:table-cell">
                                ID
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Producto
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Categoría
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Precio
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Stock
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Estado
                            </th>
                            {canManageProducts && (
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600"
                                >
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50">
                                <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-500 sm:table-cell">
                                    {product.id}
                                </td>

                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-900">
                                        {product.name}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {product.description ?? "Sin descripción"}
                                    </p>
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-600">
                                    {product.category_name ?? "Sin categoría"}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-900">
                                    {formatPrice(product.price)}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">
                                    {product.stock}
                                </td>

                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            product.active
                                                ? "inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                                                : "inline-flex rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600"
                                        }
                                    >
                                        {product.active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>

                                {canManageProducts && (
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(product)}
                                                disabled={
                                                    isSubmitting ||
                                                    updatingStatusProductId !== null
                                                }
                                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => void onToggleStatus(product)}
                                                disabled={
                                                    isSubmitting ||
                                                    updatingStatusProductId !== null
                                                }
                                                className={
                                                    product.active
                                                        ? "rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                        : "rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                }
                                            >
                                                {updatingStatusProductId === product.id
                                                    ? product.active
                                                        ? "Desactivando..."
                                                        : "Activando..."
                                                    : product.active
                                                        ? "Desactivar"
                                                        : "Activar"}
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductsTable;
