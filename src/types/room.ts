export interface Room {
    id: number;
    name: string;
    display_order: number;
    type: string;
    price: number;
    note?: string;
    created_at?: string;
    updated_at?: string;
}
