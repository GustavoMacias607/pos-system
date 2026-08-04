export type Category = {
    id: number;
    name: string;
    description: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
};

export type CategoriesResponse = {
    success: true;
    data: Category[];
};
