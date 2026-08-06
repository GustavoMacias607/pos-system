export type Client = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
};

export type ClientsResponse = {
    success: true;
    data: Client[];
};

export type ClientResponse = {
    success: true;
    data: Client;
};

export type ClientMutationResponse = {
    success: true;
    data: Client;
    message: string;
};

export type CreateClientRequest = {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
};

export type UpdateClientRequest = {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
};
