import { useEffect, useMemo, useState, type SubmitEvent } from "react";

import {
    createProduct,
    getProducts,
    updateProduct,
    deactivateProduct,
    activateProduct,
} from "../services/product.service";
import type { Product, CreateProductRequest } from "../types/product";
import { getCategories } from "../services/category.service";
import { getAuthSession } from "../services/auth-storage.service";
import type { Category } from "../types/category";

import ProductFilters from "../components/products/ProductFilters";
import ProductsTable from "../components/products/ProductsTable";
import ProductForm from "../components/products/ProductForm";

function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "ALL" | "ACTIVE" | "INACTIVE"
    >("ALL");

    const [categoryFilter, setCategoryFilter] = useState("ALL");

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

    const [updatingStatusProductId, setUpdatingStatusProductId] = useState<number | null>(null);
    const [statusErrorMessage, setStatusErrorMessage] = useState("");

    const session = getAuthSession();

    const canManageProducts =
        session?.user.role === "ADMIN" ||
        session?.user.role === "SUPERVISOR";

    const filteredProducts = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        return products.filter((product) => {
            const name = product.name.toLowerCase();
            const description = product.description?.toLowerCase() ?? "";
            const categoryName = product.category_name?.toLowerCase() ?? "";

            const matchesSearch =
                normalizedSearchTerm === "" ||
                name.includes(normalizedSearchTerm) ||
                description.includes(normalizedSearchTerm) ||
                categoryName.includes(normalizedSearchTerm);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && product.active) ||
                (statusFilter === "INACTIVE" && !product.active);

            let matchesCategory = true;

            if (categoryFilter === "NONE") {
                matchesCategory = product.category_id === null;
            } else if (categoryFilter !== "ALL") {
                matchesCategory =
                    product.category_id === Number(categoryFilter);
            }

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [products, searchTerm, statusFilter, categoryFilter]);

    const productCategoryOptions = useMemo(() => {
        const categoryMap = new Map<
            number,
            {
                id: number;
                name: string;
                active: boolean | null;
            }
        >();

        products.forEach((product) => {
            if (
                product.category_id !== null &&
                product.category_name !== null
            ) {
                categoryMap.set(product.category_id, {
                    id: product.category_id,
                    name: product.category_name,
                    active: product.category_active,
                });
            }
        });

        return Array.from(categoryMap.values()).sort((firstCategory, secondCategory) =>
            firstCategory.name.localeCompare(secondCategory.name, "es")
        );
    }, [products]);

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

    const handleToggleProductStatus = async (product: Product) => {
        setStatusErrorMessage("");
        setSuccessMessage("");


        if (product.active) {
            const confirmed = window.confirm(
                `¿Seguro que deseas desactivar el producto "${product.name}"?`
            );

            if (!confirmed) {
                return;
            }
        }
        setUpdatingStatusProductId(product.id);

        try {
            const response = product.active
                ? await deactivateProduct(product.id)
                : await activateProduct(product.id);

            setProducts((currentProducts) =>
                currentProducts.map((currentProduct) =>
                    currentProduct.id === response.data.id
                        ? response.data
                        : currentProduct
                )
            );

            if (editingProductId === product.id) {
                handleCloseForm();
            }

            setSuccessMessage(
                product.active
                    ? "Producto desactivado correctamente."
                    : "Producto activado correctamente."
            );
        } catch (error) {
            setStatusErrorMessage(
                error instanceof Error
                    ? error.message
                    : "No fue posible cambiar el estado del producto."
            );
        } finally {
            setUpdatingStatusProductId(null);
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
            };
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
                <ProductForm
                    categories={categories}
                    isEditing={isEditing}
                    isSubmitting={isSubmitting}
                    name={name}
                    description={description}
                    price={price}
                    stock={stock}
                    categoryId={categoryId}
                    categoryLoadErrorMessage={categoryLoadErrorMessage}
                    categoryWarningMessage={categoryWarningMessage}
                    formErrorMessage={formErrorMessage}
                    onNameChange={setName}
                    onDescriptionChange={setDescription}
                    onPriceChange={setPrice}
                    onStockChange={setStock}
                    onCategoryChange={(value) => {
                        setCategoryId(value);
                        setCategoryWarningMessage("");
                    }}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseForm}
                />
            )}



            <ProductFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                categoryFilter={categoryFilter}
                categoryOptions={productCategoryOptions}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
                onCategoryChange={setCategoryFilter}
                onClear={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                    setCategoryFilter("ALL");
                }}
            />

            {successMessage && (
                <div
                    role="status"
                    className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                    {successMessage}
                </div>
            )}

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

            {statusErrorMessage && (
                <p
                    role="alert"
                    className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {statusErrorMessage}
                </p>
            )}

            {!isLoading &&
                !loadErrorMessage &&
                products.length > 0 &&
                filteredProducts.length === 0 && (
                    <p className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                        No se encontraron productos con la búsqueda y los filtros actuales.
                    </p>
                )}

            {!isLoading &&
                !loadErrorMessage &&
                filteredProducts.length > 0 && (
                    <ProductsTable
                        products={filteredProducts}
                        canManageProducts={canManageProducts}
                        isSubmitting={isSubmitting}
                        updatingStatusProductId={updatingStatusProductId}
                        onEdit={handleEditProduct}
                        onToggleStatus={handleToggleProductStatus}
                    />
                )}
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
