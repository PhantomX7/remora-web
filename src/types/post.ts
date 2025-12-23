export type PostCategory = "umum" | "akreditasi" | "artikel";

export interface Post {
    id: number;
    title: string;
    slug: string;
    content: string; // HTML string
    is_active: boolean;
    type?: PostCategory; 
    thumbnail_url: string;
    thumbnail_url_key: string;
    created_at: string;
    updated_at: string;
}