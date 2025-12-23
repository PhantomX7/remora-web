// lib/auth.ts
import { cookies } from "next/headers";
import type { AuthTokens } from "@/types/auth";

export type AuthScope = "admin" | "public";

const COOKIE_KEYS = {
    admin: {
        ACCESS_TOKEN: "admin_access_token",
        REFRESH_TOKEN: "admin_refresh_token",
    },
    public: {
        ACCESS_TOKEN: "public_access_token",
        REFRESH_TOKEN: "public_refresh_token",
    },
} as const;

const getCookieOptions = (isRefreshToken = false) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: isRefreshToken
        ? 7 * 24 * 60 * 60 // 7 days for refresh
        : 15 * 60, // 15 minutes for access
});

export async function getAccessToken(
    scope: AuthScope
): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_KEYS[scope].ACCESS_TOKEN)?.value;
}

export async function getRefreshToken(
    scope: AuthScope
): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_KEYS[scope].REFRESH_TOKEN)?.value;
}

export async function getAuthTokens(
    scope: AuthScope
): Promise<AuthTokens | undefined> {
    const [accessToken, refreshToken] = await Promise.all([
        getAccessToken(scope),
        getRefreshToken(scope),
    ]);

    if (!accessToken || !refreshToken) return undefined;
    return { access_token: accessToken, refresh_token: refreshToken };
}

export async function setAuthTokens(
    scope: AuthScope,
    tokens: AuthTokens
): Promise<void> {
    const cookieStore = await cookies();
    const keys = COOKIE_KEYS[scope];

    cookieStore.set(
        keys.ACCESS_TOKEN,
        tokens.access_token,
        getCookieOptions(false)
    );
    cookieStore.set(
        keys.REFRESH_TOKEN,
        tokens.refresh_token,
        getCookieOptions(true)
    );
}

export async function clearAuthTokens(scope: AuthScope): Promise<void> {
    const cookieStore = await cookies();
    const keys = COOKIE_KEYS[scope];

    cookieStore.delete(keys.ACCESS_TOKEN);
    cookieStore.delete(keys.REFRESH_TOKEN);
}
