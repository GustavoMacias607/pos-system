import type { Client } from "../../types/client";

type ClientsTableProps = {
    clients: Client[];
};

function ClientsTable({ clients }: ClientsTableProps) {

    return (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sm:table-cell">
                                ID
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Cliente
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Contacto
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Direción
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-slate-50">
                                <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-500 sm:table-cell">
                                    {client.id}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                                    {client.name}
                                </td>

                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-900">
                                        {client.email ?? "Sin correo"}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {client.phone ?? "Sin teléfono"}
                                    </p>
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {client.address ?? "Sin dirección"}
                                </td>

                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            client.active
                                                ? "inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                                                : "inline-flex rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600"
                                        }
                                    >
                                        {client.active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>


                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ClientsTable;
