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
};

export const ADMIN_API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REFRESH: "/auth/refresh",
        ME: "/auth/me",
        CHANGE_PASSWORD: "/auth/change-password",
        LOGOUT: "/auth/logout",
    },
    JOBS: {
        GENERAL: "/admin/jobs",
        DETAIL: (id: number) => `/admin/jobs/${id}`,
        CANCEL: (id: number) => `/admin/jobs/${id}/cancel`,
        RETRY: (id: number) => `/admin/jobs/${id}/retry`,
        LOGS: (id: number) => `/admin/jobs/${id}/logs`,
        STATS: "/admin/jobs/stats",
        RUNNING: "/admin/jobs/running",
        TYPES: "/admin/jobs/types",
        BY_TYPE: (type: string) =>
            `/admin/jobs/type/${encodeURIComponent(type)}`,
    },
    CONFIG: {
        GENERAL: "/admin/config",
        DETAIL: (id: number) => `/admin/config/${id}`,
        FIND_BY_KEY: (key: string) => `/admin/config/key/${key}`,
    },
    USER: {
        GENERAL: "/admin/user",
        DETAIL: (id: number) => `/admin/user/${id}`,
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
    CONFIG: {
        GENERAL: "/public/config",
        FIND_BY_KEY: (key: string) => `/public/config/key/${key}`,
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
