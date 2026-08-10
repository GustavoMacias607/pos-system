import {
    useEffect,
    useMemo,
    useState,
    type SubmitEvent,
} from "react";

import SupplierFilters from "../components/suppliers/SupplierFilters";
import SupplierForm from "../components/suppliers/SupplierForm";
import SuppliersTable from "../components/suppliers/SuppliersTable";

import { getAuthSession } from "../services/auth-storage.service";

import {
    activateSupplier,
    createSupplier,
    deactivateSupplier,
    getSuppliers,
    updateSupplier,
} from "../services/supplier.service";

import type {
    CreateSupplierRequest,
    Supplier,
    UpdateSupplierRequest,
} from "../types/supplier";

function SuppliersPage() {
    const session = getAuthSession();

    const canManageSupplierStatus =
        session?.user.role === "ADMIN" ||
        session?.user.role === "SUPERVISOR";

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingSupplierId, setEditingSupplierId] = useState<string | null>(
        null
    );

    const [name, setName] = useState("");
    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrorMessage, setFormErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [updatingStatusSupplierId, setUpdatingStatusSupplierId] = useState<
        string | null
    >(null);
    const [statusErrorMessage, setStatusErrorMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "ALL" | "ACTIVE" | "INACTIVE"
    >("ALL");

    const isEditing = editingSupplierId !== null;

    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                setIsLoading(true);
                setLoadErrorMessage("");

                const response = await getSuppliers();

                setSuppliers(response.data);
            } catch (error) {
                setLoadErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "No fue posible cargar los proveedores."
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadSuppliers();
    }, []);

    const filteredSuppliers = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        return suppliers.filter((supplier) => {
            const supplierName = supplier.name.toLowerCase();
            const supplierContactName =
                supplier.contact_name?.toLowerCase() ?? "";
            const supplierEmail = supplier.email?.toLowerCase() ?? "";
            const supplierPhone = supplier.phone?.toLowerCase() ?? "";
            const supplierAddress = supplier.address?.toLowerCase() ?? "";

            const matchesSearch =
                normalizedSearchTerm === "" ||
                supplierName.includes(normalizedSearchTerm) ||
                supplierContactName.includes(normalizedSearchTerm) ||
                supplierEmail.includes(normalizedSearchTerm) ||
                supplierPhone.includes(normalizedSearchTerm) ||
                supplierAddress.includes(normalizedSearchTerm);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && supplier.active) ||
                (statusFilter === "INACTIVE" && !supplier.active);

            return matchesSearch && matchesStatus;
        });
    }, [suppliers, searchTerm, statusFilter]);

    const resetForm = () => {
        setEditingSupplierId(null);
        setName("");
        setContactName("");
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

    const handleEditSupplier = (supplier: Supplier) => {
        resetForm();

        setEditingSupplierId(supplier.id);
        setName(supplier.name);
        setContactName(supplier.contact_name ?? "");
        setEmail(supplier.email ?? "");
        setPhone(supplier.phone ?? "");
        setAddress(supplier.address ?? "");

        setSuccessMessage("");
        setShowForm(true);
    };

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedContactName = contactName.trim();
        const trimmedEmail = email.trim();
        const trimmedPhone = phone.trim();
        const trimmedAddress = address.trim();

        if (!trimmedName) {
            setFormErrorMessage("El nombre del proveedor es obligatorio.");
            return;
        }

        const createSupplierData: CreateSupplierRequest = {
            name: trimmedName,
        };

        if (trimmedContactName !== "") {
            createSupplierData.contactName = trimmedContactName;
        }

        if (trimmedEmail !== "") {
            createSupplierData.email = trimmedEmail;
        }

        if (trimmedPhone !== "") {
            createSupplierData.phone = trimmedPhone;
        }

        if (trimmedAddress !== "") {
            createSupplierData.address = trimmedAddress;
        }

        const updateSupplierData: UpdateSupplierRequest = {
            name: trimmedName,
            contactName:
                trimmedContactName === "" ? null : trimmedContactName,
            email: trimmedEmail === "" ? null : trimmedEmail,
            phone: trimmedPhone === "" ? null : trimmedPhone,
            address: trimmedAddress === "" ? null : trimmedAddress,
        };

        try {
            setIsSubmitting(true);
            setFormErrorMessage("");
            setSuccessMessage("");

            const supplierIdToUpdate = editingSupplierId;

            const response =
                supplierIdToUpdate === null
                    ? await createSupplier(createSupplierData)
                    : await updateSupplier(
                        supplierIdToUpdate,
                        updateSupplierData
                    );

            if (supplierIdToUpdate === null) {
                setSuppliers((currentSuppliers) => [
                    ...currentSuppliers,
                    response.data,
                ]);
            } else {
                setSuppliers((currentSuppliers) =>
                    currentSuppliers.map((supplier) =>
                        supplier.id === supplierIdToUpdate
                            ? response.data
                            : supplier
                    )
                );
            }

            setSuccessMessage(
                supplierIdToUpdate === null
                    ? "Proveedor creado correctamente."
                    : "Proveedor actualizado correctamente."
            );

            handleCloseForm();
        } catch (error) {
            setFormErrorMessage(
                error instanceof Error
                    ? error.message
                    : isEditing
                        ? "No fue posible actualizar el proveedor."
                        : "No fue posible crear el proveedor."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleSupplierStatus = async (supplier: Supplier) => {
        setStatusErrorMessage("");
        setSuccessMessage("");

        if (
            supplier.active &&
            !window.confirm(
                `¿Deseas desactivar al proveedor "${supplier.name}"?`
            )
        ) {
            return;
        }

        try {
            setUpdatingStatusSupplierId(supplier.id);

            const response = supplier.active
                ? await deactivateSupplier(supplier.id)
                : await activateSupplier(supplier.id);

            setSuppliers((currentSuppliers) =>
                currentSuppliers.map((currentSupplier) =>
                    currentSupplier.id === supplier.id
                        ? response.data
                        : currentSupplier
                )
            );

            if (editingSupplierId === supplier.id) {
                handleCloseForm();
            }

            setSuccessMessage(
                supplier.active
                    ? "Proveedor desactivado correctamente."
                    : "Proveedor activado correctamente."
            );
        } catch (error) {
            setStatusErrorMessage(
                error instanceof Error
                    ? error.message
                    : "No fue posible actualizar el estado del proveedor."
            );
        } finally {
            setUpdatingStatusSupplierId(null);
        }
    };

    return (
        <section className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Proveedores
                    </h2>

                    <p className="mt-1 text-slate-600">
                        Administra los proveedores registrados en el sistema.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={showForm ? handleCloseForm : handleOpenCreateForm}
                    disabled={isSubmitting}
                    aria-expanded={showForm}
                    aria-controls="supplier-form"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {showForm ? "Cerrar formulario" : "Nuevo proveedor"}
                </button>
            </div>

            {successMessage && (
                <p className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {successMessage}
                </p>
            )}

            {showForm && (
                <SupplierForm
                    isSubmitting={isSubmitting}
                    name={name}
                    contactName={contactName}
                    email={email}
                    phone={phone}
                    address={address}
                    formErrorMessage={formErrorMessage}
                    isEditing={isEditing}
                    onCancel={handleCloseForm}
                    onNameChange={setName}
                    onContactNameChange={setContactName}
                    onEmailChange={setEmail}
                    onPhoneChange={setPhone}
                    onAddressChange={setAddress}
                    onSubmit={handleSubmit}
                />
            )}

            <SupplierFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
                onClear={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                }}
            />

            {statusErrorMessage && (
                <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {statusErrorMessage}
                </p>
            )}

            {isLoading && (
                <p className="mt-6 text-slate-600">
                    Cargando proveedores...
                </p>
            )}

            {!isLoading && loadErrorMessage && (
                <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {loadErrorMessage}
                </p>
            )}

            {!isLoading &&
                !loadErrorMessage &&
                suppliers.length === 0 && (
                    <p className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                        No hay proveedores registrados.
                    </p>
                )}

            {!isLoading &&
                !loadErrorMessage &&
                suppliers.length > 0 &&
                filteredSuppliers.length === 0 && (
                    <p className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                        No se encontraron proveedores con la búsqueda y los
                        filtros actuales.
                    </p>
                )}

            {!isLoading &&
                !loadErrorMessage &&
                filteredSuppliers.length > 0 && (
                    <SuppliersTable
                        suppliers={filteredSuppliers}
                        canManageSupplierStatus={
                            canManageSupplierStatus
                        }
                        isSubmitting={isSubmitting}
                        updatingStatusSupplierId={
                            updatingStatusSupplierId
                        }
                        onEdit={handleEditSupplier}
                        onToggleStatus={handleToggleSupplierStatus}
                    />
                )}
        </section>
    );
}

export default SuppliersPage;
