import type { SubmitEvent } from "react";

import type { Category } from "../../types/category";

type ProductFormProps = {
    categories: Category[];
    isEditing: boolean;
    isSubmitting: boolean;
    name: string;
    description: string;
    price: string;
    stock: string;
    categoryId: string;
    categoryLoadErrorMessage: string;
    categoryWarningMessage: string;
    formErrorMessage: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onPriceChange: (value: string) => void;
    onStockChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
    onCancel: () => void;
};

function ProductForm({
    categories,
    isEditing,
    isSubmitting,
    name,
    description,
    price,
    stock,
    categoryId,
    categoryLoadErrorMessage,
    categoryWarningMessage,
    formErrorMessage,
    onNameChange,
    onDescriptionChange,
    onPriceChange,
    onStockChange,
    onCategoryChange,
    onSubmit,
    onCancel,
}: ProductFormProps) {
    return (

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
                <form onSubmit={onSubmit} className="mt-5 space-y-4">
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
                                onChange={(event) => onNameChange(event.target.value)}
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
                                onChange={(event) => onCategoryChange(event.target.value)}
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
                                onChange={(event) => onPriceChange(event.target.value)}
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
                                onChange={(event) => onStockChange(event.target.value)}
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
                            onChange={(event) => onDescriptionChange(event.target.value)}
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
                                onClick={onCancel}
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
    );
}

export default ProductForm;
