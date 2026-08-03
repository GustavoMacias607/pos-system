import { useEffect, useState } from "react";

import { getProducts } from "../services/product.service";
import type { Product } from "../types/product";


const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(Number(price));
};

function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");


    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await getProducts();
                setProducts(response.data);
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "No fue posible cargar los productos");
            } finally {
                setIsLoading(false);
            }
        };
        void loadProducts();
    }, []);

    return (
        <section className="p-6">
            <h2 className="text-2xl font-bold text-slate-900">
                Productos
            </h2>
            {isLoading && (
                <p className="mt-6 text-slate-600">
                    Cargando productos...
                </p>
            )}

            {!isLoading && !errorMessage && products.length === 0 && (
                <p className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                    No hay productos registrados.
                </p>
            )}

            {!isLoading && !errorMessage && products.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {errorMessage && (
                <p
                    role="alert"
                    className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {errorMessage}
                </p>
            )}
        </section>
    );
}

export default ProductsPage;
