import type { Supplier } from "../../types/supplier";

type SuppliersTableProps = {
    suppliers: Supplier[];
    canManageSupplierStatus: boolean;
    isSubmitting: boolean;
    updatingStatusSupplierId: string | null;
    onEdit: (supplier: Supplier) => void;
    onToggleStatus: (supplier: Supplier) => Promise<void>;
};

function SuppliersTable({
    suppliers,
    canManageSupplierStatus,
    isSubmitting,
    updatingStatusSupplierId,
    onEdit,
    onToggleStatus,
}: SuppliersTableProps) {
    return (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            ID
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Proveedor
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Contacto
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Dirección
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Estado
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Acciones
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                    {suppliers.map((supplier) => {
                        const isUpdatingStatus =
                            updatingStatusSupplierId === supplier.id;

                        return (
                            <tr key={supplier.id} className="hover:bg-slate-50">
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                    {supplier.id}
                                </td>

                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-900">
                                        {supplier.name}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {supplier.email ?? "Sin correo"}
                                    </p>
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-600">
                                    <p>
                                        {supplier.contact_name ??
                                            "Sin contacto"}
                                    </p>

                                    <p className="mt-1 text-slate-500">
                                        {supplier.phone ?? "Sin teléfono"}
                                    </p>
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-600">
                                    {supplier.address ?? "Sin dirección"}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${supplier.active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-slate-200 text-slate-700"
                                            }`}
                                    >
                                        {supplier.active
                                            ? "Activo"
                                            : "Inactivo"}
                                    </span>
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 ">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                isSubmitting ||
                                                isUpdatingStatus
                                            }
                                            onClick={() => onEdit(supplier)}
                                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Editar
                                        </button>

                                        {canManageSupplierStatus && (
                                            <button
                                                type="button"
                                                disabled={
                                                    isSubmitting ||
                                                    isUpdatingStatus
                                                }
                                                onClick={() =>
                                                    void onToggleStatus(
                                                        supplier
                                                    )
                                                }
                                                className={
                                                    supplier.active
                                                        ? "rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                                                        : "rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
                                                }                                            >
                                                {isUpdatingStatus
                                                    ? supplier.active
                                                        ? "Desactivando..."
                                                        : "Activando..."
                                                    : supplier.active
                                                        ? "Desactivar"
                                                        : "Activar"}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default SuppliersTable;
