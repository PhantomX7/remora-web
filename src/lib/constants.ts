// src/lib/constants.ts

import type { UserRole } from "@/types/user";

export const API_BASE_URL =
    process.env.API_BASE_URL || "https://api.example.com";

export const BANNER_KEY = {
    HOME: "home",
};

export const CONFIG_KEY = {
    INSTAGRAM: "INSTAGRAM_URL",
    FACEBOOK: "FACEBOOK_URL",
}

export const ADMIN_API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REFRESH: "/auth/refresh",
        ME: "/auth/me",
        CHANGE_PASSWORD: "/auth/change-password",
        LOGOUT: "/auth/logout",
    },
    BANNER: {
        GENERAL: "/admin/banner",
        DETAIL: (id: number) => `/admin/banner/${id}`,
    },
    BLOG: {
        GENERAL: "/admin/blog",
        DETAIL: (id: number) => `/admin/blog/${id}`,
    },
    CONFIG: {
        GENERAL: "/admin/config",
        DETAIL: (id: number) => `/admin/config/${id}`,
        FIND_BY_KEY: (key: string) => `/admin/config/key/${key}`,
    },
    DOCTOR: {
        GENERAL: "/admin/doctor",
        DETAIL: (id: number) => `/admin/doctor/${id}`,
    },
    FACILITY: {
        GENERAL: "/admin/facility",
        DETAIL: (id: number) => `/admin/facility/${id}`,
    },
    INSURANCE: {
        GENERAL: "/admin/insurance",
        DETAIL: (id: number) => `/admin/insurance/${id}`,
    },
    POST: {
        GENERAL: "/admin/post",
        DETAIL: (id: number) => `/admin/post/${id}`,
    },
    SPECIALIST: {
        GENERAL: "/admin/specialist",
        DETAIL: (id: number) => `/admin/specialist/${id}`,
    },
    ROOM: {
        GENERAL: "/admin/room",
        DETAIL: (id: number) => `/admin/room/${id}`,
    },
    USER: {
        GENERAL: "/admin/user",
        DETAIL: (id: number) => `/admin/user/${id}`,
    },
    MEDIA: {
        UPLOAD: "/admin/media",
    },
} as const;

export const PUBLIC_API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REFRESH: "/auth/refresh",
        ME: "/auth/me",
        CHANGE_PASSWORD: "/auth/change-password",
        LOGOUT: "/auth/logout",
    },
    BANNER: {
        GENERAL: "/public/banner",
    },
    BLOG: {
        GENERAL: "/public/blog",
        DETAIL: (slug: string) => `/public/blog/${slug}`,
    },
    CONFIG: {
        GENERAL: "/public/config",
        FIND_BY_KEY: (key: string) => `/public/config/key/${key}`,
    },
    CONTACT: {
        GENERAL: "/public/contact",
    },
    DOCTOR: {
        GENERAL: "/public/doctor",
        DETAIL: (id: number) => `/public/doctor/${id}`,
    },
    FACILITY: {
        GENERAL: "/public/facility",
        DETAIL: (id: number) => `/public/facility/${id}`,
    },
    INSURANCE: {
        GENERAL: "/public/insurance",
        DETAIL: (id: number) => `/public/insurance/${id}`,
    },
    POST: {
        GENERAL: "/public/post",
        DETAIL: (slug: string) => `/public/post/${slug}`,
    },
    ROOM: {
        GENERAL: "/public/room",
        DETAIL: (id: number) => `/public/room/${id}`,
    },
    SPECIALIST: {
        GENERAL: "/public/specialist",
        DETAIL: (id: number) => `/public/specialist/${id}`,
    },
} as const;

export const TOKEN_KEYS = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
} as const;

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
};

// Define distinct keys for each scope
export const AUTH_COOKIES = {
    ADMIN: {
        ACCESS_TOKEN: "admin_access_token",
        REFRESH_TOKEN: "admin_refresh_token",
    },
    PUBLIC: {
        ACCESS_TOKEN: "public_access_token",
        REFRESH_TOKEN: "public_refresh_token",
    },
} as const;

export type AuthScope = "admin" | "public";

export const roleColors: Record<
    UserRole,
    "default" | "secondary" | "destructive" | "outline"
> = {
    admin: "destructive",
    root: "default",
};
