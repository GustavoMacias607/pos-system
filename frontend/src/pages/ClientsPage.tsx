import { useEffect, useState } from "react";

import ClientsTable from "../components/clients/ClientsTable";
import { getClients } from "../services/client.service";
import type { Client } from "../types/client";

function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState("");

    useEffect(() => {
        const loadClients = async () => {
            try {
                const response = await getClients();
                setClients(response.data);
            } catch (error) {
                setLoadErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "No fue posible cargar los clientes."
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadClients();
    }, []);
    return (
        <section className="p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-slate-900">
                Clientes
            </h2>

            <p className="mt-1 text-slate-600">
                Consulta y administra los clientes registrados.
            </p>
            {isLoading && (
                <p className="mt-6 text-slate-600">
                    Cargando clientes...
                </p>
            )}

            {!isLoading && loadErrorMessage && (
                <p
                    role="alert"
                    className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {loadErrorMessage}
                </p>
            )}
            {!isLoading && !loadErrorMessage && clients.length === 0 && (
                <p className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                    No hay clientes registrados.
                </p>
            )}
            {!isLoading && !loadErrorMessage && clients.length > 0 && (
                <ClientsTable clients={clients} />
            )}
        </section>
    );
}

export default ClientsPage;
