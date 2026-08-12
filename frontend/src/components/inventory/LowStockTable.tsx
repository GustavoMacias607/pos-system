import type { LowStockProduct } from "../../types/inventory";

type LowStockTableProps = {
    products: LowStockProduct[];
};


function LowStockTable({ products }: LowStockTableProps) {


    return (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Producto
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Categoría
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Stock actual
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Stock mínimo
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {products.map((product) => {
                            const isOutOfStock = product.stock === 0;

                            return (
                                <tr key={product.id} className="hover:bg-slate-50">
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

                                    <td className="font-bold whitespace-nowrap px-4 py-3 text-right text-sm"
                                    >
                                        {product.stock}
                                    </td>
                                    <td className="font-semibold whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">
                                        {product.minimum_stock}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                isOutOfStock
                                                    ? "inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                                                    : "inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700"
                                            }
                                        >
                                            {isOutOfStock ? "Sin stock" : "Stock bajo"}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div >
    );
}

export default LowStockTable;
