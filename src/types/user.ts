export type UserRole = "admin" | "root"; // Adjust based on your actual roles

export type User = {
    id: number;
    name: string;
    business_name: string;
    username: string;
    email: string;
    phone: string;
    is_active: boolean;
    role: UserRole;
    created_at: string;
};
