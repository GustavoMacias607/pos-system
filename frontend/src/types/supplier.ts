export type Supplier = {
    id: string;
    name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
};

export type SuppliersResponse = {
    success: true;
    data: Supplier[];
};

export type SupplierResponse = {
    success: true;
    data: Supplier;
};

export type SupplierMutationResponse = {
    success: true;
    data: Supplier;
    message: string;
};

export type CreateSupplierRequest = {
    name: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
};

export type UpdateSupplierRequest = {
    name?: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
};
