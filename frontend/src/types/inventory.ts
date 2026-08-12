export type InventoryMovementType =
    | "PURCHASE"
    | "SALE"
    | "WASTE"
    | "SUPPLIER_RETURN"
    | "CUSTOMER_RETURN"
    | "MANUAL_ADJUSTMENT";

export type InventoryMovement = {
    id: number;
    product_id: number;
    product_name: string | null;
    type: InventoryMovementType;
    quantity: number;
    reason: string | null;
    created_at: string;
};

export type InventoryMovementsResponse = {
    success: true;
    data: InventoryMovement[];
};

export type LowStockProduct = {
    id: number;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    minimum_stock: number;
    active: boolean;
    category_id: number | null;
    category_name: string | null;
    category_active: boolean | null;
    created_at: string;
    updated_at: string;
};

export type LowStockProductsResponse = {
    success: true;
    data: LowStockProduct[];
};

export type InventoryUpdatedProduct = {
    id: number;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    minimum_stock: number;
    active: boolean;
    category_id: number | null;
    created_at: string;
    updated_at: string;
};

export type CreatedInventoryMovement = {
    id: number;
    product_id: number;
    type: InventoryMovementType;
    quantity: number;
    reason: string | null;
    created_at: string;
    purchase_id: string | null;
};

export type InventoryMutationResponse = {
    success: true;
    data: {
        product: InventoryUpdatedProduct;
        movement: CreatedInventoryMovement;
    };
    message: string;
};

export type InventoryAdjustmentRequest = {
    productId: number;
    quantity: number;
    reason: string;
};

export type StockEntryRequest = {
    productId: number;
    quantity: number;
    reason: string;
};

export type WasteRequest = {
    productId: number;
    quantity: number;
    reason: string;
};

export type InventoryMovementFilters = {
    type?: InventoryMovementType;
    productId?: number;
};
