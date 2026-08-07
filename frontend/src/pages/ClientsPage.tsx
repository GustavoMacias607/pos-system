import { useEffect, useState, type SubmitEvent } from "react";

import ClientsTable from "../components/clients/ClientsTable";
import ClientForm from "../components/clients/ClientForm";

import { createClient, getClients } from "../services/client.service";
import type { Client, CreateClientRequest } from "../types/client";

function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrorMessage, setFormErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const resetForm = () => {
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setFormErrorMessage("");
    };

    const handleOpenCreateForm = () => {
        resetForm();
        setSuccessMessage("");
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
        const trimmedEmail = email.trim();
        const trimmedPhone = phone.trim();
        const trimmedAddress = address.trim();

        if (trimmedName === "") {
            setFormErrorMessage("El nombre del cliente es obligatorio.");
            return;
        }

        const clientData: CreateClientRequest = {
            name: trimmedName,
        };

        if (trimmedEmail !== "") {
            clientData.email = trimmedEmail;
        }

        if (trimmedPhone !== "") {
            clientData.phone = trimmedPhone;
        }

        if (trimmedAddress !== "") {
            clientData.address = trimmedAddress;
        }

        setIsSubmitting(true);

        try {
            const response = await createClient(clientData);

            setClients((currentClients) => [
                ...currentClients,
                response.data,
            ]);

            resetForm();
            setSuccessMessage("Cliente creado correctamente.");
        } catch (error) {
            setFormErrorMessage(
                error instanceof Error
                    ? error.message
                    : "No fue posible crear el cliente."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Clientes
                    </h2>

                    <p className="mt-1 text-slate-600">
                        Consulta y administra los clientes registrados.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={showForm ? handleCloseForm : handleOpenCreateForm}
                    aria-expanded={showForm}
                    aria-controls="client-form"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 sm:w-auto"
                >
                    {showForm ? "Cerrar formulario" : "Nuevo cliente"}
                </button>
            </div>

            {showForm && (
                <ClientForm
                    isSubmitting={isSubmitting}
                    name={name}
                    email={email}
                    phone={phone}
                    address={address}
                    formErrorMessage={formErrorMessage}
                    onNameChange={setName}
                    onEmailChange={setEmail}
                    onPhoneChange={setPhone}
                    onAddressChange={setAddress}
                    onSubmit={handleSubmit}
                />
            )}

            {successMessage && (
                <div
                    role="status"
                    className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                    {successMessage}
                </div>
            )}


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
