import { useEffect, useState, type SubmitEvent } from "react";

import {
    createProduct,
    getProducts,
    updateProduct,
} from "../services/product.service";
import type { Product, CreateProductRequest } from "../types/product";
import { getCategories } from "../services/category.service";
import { getAuthSession } from "../services/auth-storage.service";
import type { Category } from "../types/category";

const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(Number(price));
};

function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryLoadErrorMessage, setCategoryLoadErrorMessage] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrorMessage, setFormErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [categoryWarningMessage, setCategoryWarningMessage] = useState("");

    const isEditing = editingProductId !== null;

    const session = getAuthSession();

    const canManageProducts =
        session?.user.role === "ADMIN" ||
        session?.user.role === "SUPERVISOR";

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setStock("");
        setCategoryId("");
        setEditingProductId(null);
        setCategoryWarningMessage("");
        setFormErrorMessage("");
        setSuccessMessage("");
    };

    const handleOpenCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    const handleCloseForm = () => {
        resetForm();
        setShowForm(false);
    };

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        setFormErrorMessage("");
        setSuccessMessage("");

        const trimmedName = name.trim();
        const trimmedDescription = description.trim();
        const parsedPrice = Number(price);
        const parsedStock = Number(stock);
        const parsedCategoryId = categoryId === "" ? undefined : Number(categoryId);

        if (trimmedName === "") {
            setFormErrorMessage("El nombre del producto es obligatorio.");
            return;
        }

        if (price.trim() === "" || !Number.isFinite(parsedPrice)) {
            setFormErrorMessage("El precio debe ser un número válido.");
            return;
        }

        if (parsedPrice < 0) {
            setFormErrorMessage("El precio no puede ser negativo.");
            return;
        }

        if (stock.trim() === "" || !Number.isInteger(parsedStock)) {
            setFormErrorMessage("El stock debe ser un número entero.");
            return;
        }

        if (parsedStock < 0) {
            setFormErrorMessage("El stock no puede ser negativo.");
            return;
        }

        if (
            parsedCategoryId !== undefined &&
            (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0)
        ) {
            setFormErrorMessage(
                "El ID de la categoría debe ser un entero positivo."
            );
            return;
        }

        const productData: CreateProductRequest = {
            name: trimmedName,
            price: parsedPrice,
            stock: parsedStock,
        };

        if (trimmedDescription) {
            productData.description = trimmedDescription;
        }

        if (parsedCategoryId !== undefined) {
            productData.categoryId = parsedCategoryId;
        }

        setIsSubmitting(true);
        const productIdToUpdate = editingProductId;
        try {
            const response =
                productIdToUpdate === null
                    ? await createProduct(productData)
                    : await updateProduct(productIdToUpdate, productData);

            setProducts((currentProducts) => {
                if (productIdToUpdate === null) {
                    return [...currentProducts, response.data];
                }

                return currentProducts.map((product) =>
                    product.id === response.data.id
                        ? response.data
                        : product
                );
            });

            resetForm();

            setSuccessMessage(
                productIdToUpdate === null
                    ? "Producto creado correctamente."
                    : "Producto actualizado correctamente."
            );
        } catch (error) {
            setFormErrorMessage(
                error instanceof Error
                    ? error.message
                    : productIdToUpdate === null
                        ? "No fue posible crear el producto."
                        : "No fue posible actualizar el producto."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditProduct = (product: Product) => {
        resetForm();

        setEditingProductId(product.id);
        setName(product.name);
        setDescription(product.description ?? "");
        setPrice(product.price);
        setStock(String(product.stock));
        setShowForm(true);

        if (product.category_id !== null && product.category_active) {
            setCategoryId(String(product.category_id));
        } else {
            setCategoryId("");

            if (product.category_id !== null) {
                setCategoryWarningMessage(
                    "La categoría actual está inactiva. Selecciona una categoría activa o deja el producto sin categoría."
                );
            }
        }
    };


    useEffect(() => {

        if (canManageProducts) {
            const loadCategories = async () => {
                try {
                    const response = await getCategories();
                    setCategories(response.data.filter((category) => category.active));
                } catch (error) {
                    setCategoryLoadErrorMessage(error instanceof Error ? error.message : "No fue posible cargar las categorías.");
                }
            }
            void loadCategories();
        }


        const loadProducts = async () => {
            try {
                const response = await getProducts();
                setProducts(response.data);
            } catch (error) {
                setLoadErrorMessage(error instanceof Error ? error.message : "No fue posible cargar los productos");
            } finally {
                setIsLoading(false);
            }
        };
        void loadProducts();
    }, [canManageProducts]);

    return (
        <section className="p-4 sm:p-6">


            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Productos
                    </h2>

                    <p className="mt-1 text-slate-600">
                        Administra los productos disponibles.
                    </p>
                </div>

                {canManageProducts && (
                    <button
                        type="button"
                        onClick={showForm ? handleCloseForm : handleOpenCreateForm}
                        aria-expanded={showForm}
                        aria-controls="product-form"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 sm:w-auto"
                    >
                        {showForm ? "Cerrar formulario" : "Nuevo producto"}
                    </button>
                )}
            </div>


            {canManageProducts && showForm && (
                <div id="product-form" className="mt-6 flex justify-center sm:justify-end">
                    <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                {isEditing ? "Editar producto" : "Nuevo producto"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                {isEditing
                                    ? "Modifica la información del producto seleccionado."
                                    : "Registra un producto y define su precio, stock y categoría."}
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="product-name"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        id="product-name"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="product-category"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        Categoría
                                        <span className="ml-1 font-normal text-slate-400">
                                            (opcional)
                                        </span>
                                    </label>

                                    <select
                                        id="product-category"
                                        value={categoryId}
                                        onChange={(event) => {
                                            setCategoryId(event.target.value);
                                            setCategoryWarningMessage("");
                                        }}
                                        disabled={isSubmitting || Boolean(categoryLoadErrorMessage)}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    >
                                        <option value="">Sin categoría</option>

                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="product-price"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        Precio
                                    </label>

                                    <input
                                        type="number"
                                        id="product-price"
                                        value={price}
                                        onChange={(event) => setPrice(event.target.value)}
                                        min="0"
                                        step="0.01"
                                        inputMode="decimal"
                                        required
                                        disabled={isSubmitting}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="product-stock"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        id="product-stock"
                                        value={stock}
                                        onChange={(event) => setStock(event.target.value)}
                                        min="0"
                                        step="1"
                                        inputMode="numeric"
                                        required
                                        disabled={isSubmitting}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="product-description"
                                    className="block text-sm font-medium text-slate-700"
                                >
                                    Descripción
                                    <span className="ml-1 font-normal text-slate-400">
                                        (opcional)
                                    </span>
                                </label>

                                <textarea
                                    id="product-description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    disabled={isSubmitting}
                                    rows={3}
                                    className="mt-1 block w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                />
                            </div>
                            {categoryWarningMessage && (
                                <div
                                    role="status"
                                    className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700"
                                >
                                    {categoryWarningMessage}
                                </div>
                            )}

                            {categoryLoadErrorMessage && (
                                <div
                                    role="alert"
                                    className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {categoryLoadErrorMessage}
                                </div>
                            )}

                            {formErrorMessage && (
                                <div
                                    role="alert"
                                    className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {formErrorMessage}
                                </div>
                            )}

                            {successMessage && (
                                <div
                                    role="status"
                                    className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
                                >
                                    {successMessage}
                                </div>
                            )}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {isSubmitting
                                        ? isEditing
                                            ? "Guardando..."
                                            : "Creando..."
                                        : isEditing
                                            ? "Guardar cambios"
                                            : "Crear producto"}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        disabled={isSubmitting}
                                        className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        Cancelar edición
                                    </button>
                                )}
                            </div>


                        </form>
                    </div>
                </div >
            )
            }




            {
                isLoading && (
                    <p className="mt-6 text-slate-600">
                        Cargando productos...
                    </p>
                )
            }

            {
                !isLoading && !loadErrorMessage && products.length === 0 && (
                    <p className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                        No hay productos registrados.
                    </p>
                )
            }

            {
                !isLoading && !loadErrorMessage && products.length > 0 && (
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
                                                    <button
                                                        disabled={isSubmitting}
                                                        type="button"
                                                        onClick={() => handleEditProduct(product)}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Editar
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {
                loadErrorMessage && (
                    <p
                        role="alert"
                        className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {loadErrorMessage}
                    </p>
                )
            }
        </section >
    );
}

export default ProductsPage;
