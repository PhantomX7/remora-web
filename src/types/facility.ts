export interface Facility {
    id: number;
    icon_url: string;
    icon_url_key?: string; // Added in ToResponse
    name: string;
    display_order: number;
    description: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}
