import { useEffect, useState, type SubmitEvent } from "react";
import { getCategories, createCategory, updateCategory, deactivateCategory, activateCategory } from "../services/category.service";
import type { Category, CreateCategoryRequest } from "../types/category";
import { getAuthSession } from "../services/auth-storage.service";

function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrorMessage, setFormErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [updatingStatusCategoryId, setUpdatingStatusCategoryId] = useState<number | null>(null);
    const [statusErrorMessage, setStatusErrorMessage] = useState("");
    const [statusSuccessMessage, setStatusSuccessMessage] = useState("");

    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const isEditing = editingCategoryId !== null;

    const session = getAuthSession();

    const canManageCategories = session?.user.role === "ADMIN" || session?.user.role === "SUPERVISOR";




    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        setFormErrorMessage("");
        setSuccessMessage("");

        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        if (trimmedName === "") {
            setFormErrorMessage("El nombre de la categoría es obligatorio.");
            return;
        }

        const categoryData: CreateCategoryRequest = {
            name: trimmedName,
        };
        if (trimmedDescription) {
            categoryData.description = trimmedDescription;
        }
        setIsSubmitting(true);
        try {
            if (editingCategoryId !== null) {
                const response = await updateCategory(editingCategoryId, categoryData);

                setCategories((currentCategories) =>
                    currentCategories.map((category) =>
                        category.id === response.data.id ? response.data : category
                    )
                );

                setName(response.data.name);
                setDescription(response.data.description ?? "");
                setSuccessMessage("Categoría actualizada correctamente.");
                return;
            }

            const response = await createCategory(categoryData);
            setCategories((currentCategories) => [...currentCategories, response.data]);
            setName("");
            setDescription("");
            setSuccessMessage("Categoría creada correctamente.");
        } catch (error) {
            setFormErrorMessage(
                error instanceof Error
                    ? error.message
                    : isEditing
                        ? "No fue posible actualizar la categoría."
                        : "No fue posible crear la categoría."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategoryId(category.id);
        setName(category.name);
        setDescription(category.description ?? "");
        setFormErrorMessage("");
        setSuccessMessage("");
        setShowForm(true);
    };

    const handleOpenCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    const handleCloseForm = () => {
        resetForm();
        setShowForm(false);
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setEditingCategoryId(null);
        setFormErrorMessage("");
        setSuccessMessage("");
    };


    const handleToggleCategoryStatus = async (category: Category) => {
        setStatusErrorMessage("");
        setStatusSuccessMessage("");

        if (category.active) {
            const confirmed = window.confirm(
                `¿Seguro que deseas desactivar la categoría "${category.name}"?`
            );

            if (!confirmed) {
                return;
            }
        }

        setUpdatingStatusCategoryId(category.id);

        try {
            const response = category.active ? await deactivateCategory(category.id) : await activateCategory(category.id);
            setCategories((currentCategories) =>
                currentCategories.map((currentCategory) =>
                    currentCategory.id === response.data.id
                        ? response.data
                        : currentCategory
                )
            );

            setStatusSuccessMessage(
                category.active
                    ? "Categoría desactivada correctamente."
                    : "Categoría activada correctamente."
            );
        } catch (error) {
            setStatusErrorMessage(
                error instanceof Error
                    ? error.message
                    : category.active
                        ? "No fue posible desactivar la categoría."
                        : "No fue posible activar la categoría."
            );
        } finally {
            setUpdatingStatusCategoryId(null);
        }
    };

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data);
            } catch (error) {
                setLoadErrorMessage(error instanceof Error ? error.message : "No fue posible cargar las categorías.");
            } finally {
                setIsLoading(false);
            }
        };
        void loadCategories();
    }, []);

    return (
        <section className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Categorías
                    </h2>

                    <p className="mt-1 text-slate-600">
                        Administra las categorías utilizadas para organizar los productos.
                    </p>
                </div>

                {canManageCategories && (
                    <button
                        type="button"
                        onClick={showForm ? handleCloseForm : handleOpenCreateForm}
                        aria-expanded={showForm}
                        aria-controls="category-form"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 sm:w-auto"
                    >
                        {showForm ? "Cerrar formulario" : "Nueva categoría"}
                    </button>
                )}
            </div>

            {statusErrorMessage && (
                <p
                    role="alert"
                    className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {statusErrorMessage}
                </p>
            )}

            {statusSuccessMessage && (
                <p
                    role="status"
                    className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                    {statusSuccessMessage}
                </p>
            )}
            {canManageCategories && showForm && (
                <div id="category-form" className="mt-6 flex justify-center sm:justify-end">
                    <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                {isEditing ? "Editar categoría" : "Nueva categoría"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                {isEditing
                                    ? "Modifica la información de la categoría seleccionada."
                                    : "Registra una categoría para organizar los productos."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            <div>
                                <label
                                    htmlFor="category-name"
                                    className="block text-sm font-medium text-slate-700"
                                >
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    id="category-name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="category-description"
                                    className="block text-sm font-medium text-slate-700"
                                >
                                    Descripción
                                    <span className="ml-1 font-normal text-slate-400">
                                        (opcional)
                                    </span>
                                </label>

                                <textarea
                                    id="category-description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    disabled={isSubmitting}
                                    rows={3}
                                    className="mt-1 block w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                />
                            </div>

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
                                            : "Crear categoría"}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        disabled={isSubmitting}
                                        className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        Cancelar edición
                                    </button>
                                )}
                            </div>


                        </form>
                    </div>
                </div>
            )}

            {isLoading && (
                <p className="mt-6 text-slate-600">
                    Cargando categorías...
                </p>
            )}

            {!isLoading && !loadErrorMessage && categories.length === 0 && (
                <p className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                    No hay categorías registradas.
                </p>
            )}

            {loadErrorMessage && (
                <p
                    role="alert"
                    className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {loadErrorMessage}
                </p>
            )}

            {!isLoading && !loadErrorMessage && categories.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sm:table-cell"
                                    >
                                        ID
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-4"
                                    >
                                        Categoría
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-4"
                                    >
                                        Estado
                                    </th>
                                    {canManageCategories && (
                                        <th
                                            scope="col"
                                            className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-4"
                                        >
                                            Acciones
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-slate-50">
                                        <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-500 sm:table-cell">
                                            {category.id}
                                        </td>

                                        <td className="min-w-0 px-3 py-3 sm:px-4">
                                            <p className="wrap-break-word font-medium text-slate-900">
                                                {category.name}
                                            </p>

                                            <p className="mt-1 wrap-break-word text-sm text-slate-500">
                                                {category.description ?? "Sin descripción"}
                                            </p>
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-3 sm:px-4">
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
                                        {canManageCategories && (
                                            <td className="whitespace-nowrap px-3 py-3 text-right sm:px-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        disabled={updatingStatusCategoryId !== null}
                                                        type="button"
                                                        onClick={() => handleEditCategory(category)}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={updatingStatusCategoryId !== null}
                                                        onClick={() => void handleToggleCategoryStatus(category)}
                                                        className={
                                                            category.active
                                                                ? "rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                : "rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                        }
                                                    >
                                                        {updatingStatusCategoryId === category.id
                                                            ? category.active
                                                                ? "Desactivando..."
                                                                : "Activando..."
                                                            : category.active
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
            )}
        </section>
    );
}

export default CategoriesPage;
