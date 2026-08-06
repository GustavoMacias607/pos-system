export type Product = {
    id: number;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    active: boolean;
    category_id: number | null;
    category_name: string | null;
    category_active: boolean | null;
    created_at: string;
    updated_at: string;
};

export type ProductsResponse = {
    success: true;
    data: Product[];
};

export type CreateProductRequest = {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId?: number;
};

export type ProductResponse = {
    success: true;
    data: Product;
};
