import type { SubmitEvent } from "react";

type SupplierFormProps = {
    isSubmitting: boolean;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    formErrorMessage: string;
    isEditing: boolean;
    onCancel: () => void;
    onNameChange: (value: string) => void;
    onContactNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onAddressChange: (value: string) => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

function SupplierForm({
    isSubmitting,
    name,
    contactName,
    email,
    phone,
    address,
    formErrorMessage,
    isEditing,
    onCancel,
    onNameChange,
    onContactNameChange,
    onEmailChange,
    onPhoneChange,
    onAddressChange,
    onSubmit,
}: SupplierFormProps) {
    return (
        <div id="supplier-form" className="mt-6 flex justify-center sm:justify-end">
            <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                        {isEditing ? "Editar proveedor" : "Nuevo proveedor"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                        {isEditing
                            ? "Modifica la información del proveedor."
                            : "Registra un nuevo proveedor en el sistema."}
                    </p>
                </div>

                {formErrorMessage && (
                    <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {formErrorMessage}
                    </p>
                )}

                <form className="mt-5 space-y-4" onSubmit={onSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="supplier-name"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Nombre
                            </label>

                            <input
                                id="supplier-name"
                                type="text"
                                required
                                autoComplete="organization"
                                value={name}
                                onChange={(event) => onNameChange(event.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="supplier-contact-name"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Contacto
                                <span className="ml-1 font-normal text-slate-400">
                                    (opcional)
                                </span>
                            </label>

                            <input
                                id="supplier-contact-name"
                                type="text"
                                autoComplete="name"
                                value={contactName}
                                onChange={(event) =>
                                    onContactNameChange(event.target.value)
                                }
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="supplier-email"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Correo
                                <span className="ml-1 font-normal text-slate-400">
                                    (opcional)
                                </span>
                            </label>

                            <input
                                id="supplier-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => onEmailChange(event.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="supplier-phone"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Teléfono
                                <span className="ml-1 font-normal text-slate-400">
                                    (opcional)
                                </span>
                            </label>

                            <input
                                id="supplier-phone"
                                type="tel"
                                autoComplete="tel"
                                value={phone}
                                onChange={(event) => onPhoneChange(event.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="supplier-address"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Dirección
                            <span className="ml-1 font-normal text-slate-400">
                                (opcional)
                            </span>
                        </label>

                        <textarea
                            id="supplier-address"
                            rows={3}
                            autoComplete="street-address"
                            value={address}
                            onChange={(event) => onAddressChange(event.target.value)}
                            className="mt-1 block w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
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
                                    : "Crear proveedor"}
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
        </div>
    );
}

export default SupplierForm;
