import { useEffect, useState } from "react";
import { getCategories } from "../services/category.service";
import type { Category } from "../types/category";

function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data);
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "No fue posible cargar las categorías");
            } finally {
                setIsLoading(false);
            }
        };
        void loadCategories();
    }, []);

    return (
        <section className="p-6">
            <h2 className="text-2xl font-bold text-slate-900">
                Categorías
            </h2>

            <p className="mt-1 text-slate-600">
                Administra las categorías utilizadas para organizar los productos.
            </p>

            {isLoading && (
                <p className="mt-6 text-slate-600">Cargando categorías...</p>
            )}

            {!isLoading && !errorMessage && categories.length === 0 && (
                <p className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                    No hay categorías registradas.
                </p>
            )}

            {errorMessage && (
                <p
                    role="alert"
                    className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {errorMessage}
                </p>
            )}
            {!isLoading && !errorMessage && categories.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        ID
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Categoría
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                                            {category.id}
                                        </td>

                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">
                                                {category.name}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {category.description ?? "Sin descripción"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={
                                                    category.active
                                                        ? "inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                                                        : "inline-flex rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600"
                                                }
                                            >
                                                {category.active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}

export default CategoriesPage;
