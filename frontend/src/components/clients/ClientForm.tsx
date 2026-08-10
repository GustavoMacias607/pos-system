import type { SubmitEvent } from "react";

type ClientFormProps = {
    isSubmitting: boolean;
    name: string;
    email: string;
    phone: string;
    address: string;
    formErrorMessage: string;
    isEditing: boolean;
    onCancel: () => void;
    onNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onAddressChange: (value: string) => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

function ClientForm({
    isEditing,
    isSubmitting,
    name,
    email,
    phone,
    address,
    formErrorMessage,
    onCancel,
    onNameChange,
    onEmailChange,
    onPhoneChange,
    onAddressChange,
    onSubmit,
}: ClientFormProps) {
    return (
        <div id="client-form" className="mt-6 flex justify-center sm:justify-end">
            <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                        {isEditing ? "Editar cliente" : "Nuevo cliente"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {isEditing
                            ? "Modifica la información del cliente seleccionado."
                            : "Registra los datos del cliente. El correo, teléfono y dirección son opcionales."}
                    </p>
                </div>
                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="client-name"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Nombre
                            </label>

                            <input
                                type="text"
                                id="client-name"
                                value={name}
                                autoComplete="name"
                                onChange={(event) => onNameChange(event.target.value)}
                                required
                                disabled={isSubmitting}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="client-email"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Correo
                                <span className="ml-1 font-normal text-slate-400">
                                    (opcional)
                                </span>
                            </label>

                            <input
                                type="email"
                                id="client-email"
                                value={email}
                                autoComplete="email"
                                onChange={(event) => onEmailChange(event.target.value)}
                                disabled={isSubmitting}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="client-phone"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Teléfono
                            <span className="ml-1 font-normal text-slate-400">
                                (opcional)
                            </span>
                        </label>

                        <input
                            type="tel"
                            id="client-phone"
                            value={phone}
                            autoComplete="tel"
                            onChange={(event) => onPhoneChange(event.target.value)}
                            disabled={isSubmitting}
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="client-address"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Dirección
                            <span className="ml-1 font-normal text-slate-400">
                                (opcional)
                            </span>
                        </label>

                        <textarea
                            id="client-address"
                            className="mt-1 block w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            value={address}
                            onChange={(event) => onAddressChange(event.target.value)}
                            disabled={isSubmitting}
                            rows={3}
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
                                    : "Crear cliente"}
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

export default ClientForm;
