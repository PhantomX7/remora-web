// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIES } from "@/lib/constants"; // Import the new constants

export function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // 1. Skip middleware for static files and API routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    // =========================================================
    // ADMIN AUTHENTICATION LOGIC
    // =========================================================
    if (pathname.startsWith("/admin")) {
        const hasAdminToken = request.cookies.has(
            AUTH_COOKIES.ADMIN.ACCESS_TOKEN
        );
        const isAdminLoginPage = pathname === "/admin/login";

        // Case A: Admin is logged in, trying to access login page -> Redirect to Dashboard
        if (isAdminLoginPage && hasAdminToken) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }

        // Case B: Admin is NOT logged in, trying to access protected admin page -> Redirect to Login
        if (!isAdminLoginPage && !hasAdminToken) {
            const loginUrl = new URL("/admin/login", request.url);
            // Preserve the original URL to redirect back after login
            loginUrl.searchParams.set(
                "from",
                pathname + searchParams.toString()
            );
            return NextResponse.redirect(loginUrl);
        }

        // Allow access to admin pages
        return NextResponse.next();
    }

    // =========================================================
    // PUBLIC AUTHENTICATION LOGIC (Optional but recommended)
    // =========================================================
    const hasPublicToken = request.cookies.has(
        AUTH_COOKIES.PUBLIC.ACCESS_TOKEN
    );
    const isPublicLoginPage = pathname === "/login" || pathname === "/register";

    // Define your protected public routes here
    const isProtectedPublicRoute =
        pathname.startsWith("/profile") || pathname.startsWith("/account");

    // Case C: Customer is logged in, trying to access login/register -> Redirect to Home
    if (isPublicLoginPage && hasPublicToken) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Case D: Customer is NOT logged in, trying to access protected page -> Redirect to Login
    if (isProtectedPublicRoute && !hasPublicToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname + searchParams.toString());
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
