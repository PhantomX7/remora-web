// hooks/admin/use-auth.ts
"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    loginAction,
    logoutAction,
    getMeAction,
    changePasswordAction,
} from "@/actions/admin/auth";
import {
    handleActionResult,
    getErrorType,
    getErrorMessage,
    ErrorTypes,
} from "@/lib/helpers";
import type { LoginCredentials, ChangePasswordData } from "@/types/auth";
import type { ApiError } from "@/types/common";

const QUERY_KEY = ["admin", "user"] as const;

export type AuthStatus =
    | "loading"
    | "authenticated"
    | "unauthenticated"
    | "error";

/**
 * Main auth query - React Query is the single source of truth
 */
export function useAdminAuth() {
    const queryClient = useQueryClient();

    const { data, isLoading, refetch } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: getMeAction,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    // Determine auth status based on response
    let status: AuthStatus = "loading";
    let errorMessage: string | null = null;

    if (isLoading) {
        status = "loading";
    } else if (data?.success && data?.data) {
        status = "authenticated";
    } else if (data) {
        const errorType = getErrorType(data);

        if (errorType === ErrorTypes.NOT_AUTHENTICATED) {
            status = "unauthenticated";
        } else {
            status = "error";
            errorMessage = getErrorMessage(data);
        }
    }

    // Force logout - clears everything and redirects
    const forceLogout = useCallback(async () => {
        try {
            await logoutAction();
        } catch {
            // Ignore errors
        }
        queryClient.clear();
        window.location.href = "/admin/login";
    }, [queryClient]);

    // Auto-logout when status is unauthenticated or error (optional)
    // useEffect(() => {
    //     if (!isLoading && status !== "authenticated" && status !== "loading") {
    //         forceLogout();
    //     }
    // }, [isLoading, status, forceLogout]);

    return {
        user: data?.data ?? null,
        status,
        error: errorMessage,
        isLoading,
        isAuthenticated: status === "authenticated",
        isError: status === "error",
        refetch,
        forceLogout,
    };
}

// ... rest of the file remains the same

/**
 * Separated auth mutations hook
 */
export function useAdminAuthMutations() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const invalidateAuth = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }, [queryClient]);

    const clearAuth = useCallback(() => {
        queryClient.removeQueries({ queryKey: QUERY_KEY });
    }, [queryClient]);

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginCredentials) =>
            handleActionResult(loginAction(credentials)),
        onSuccess: async () => {
            await invalidateAuth();
            toast.success("Login successful!");
            router.push("/admin");
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Login failed");
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logoutAction,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            queryClient.setQueryData(QUERY_KEY, { success: false, data: null });
        },
        onSuccess: () => {
            toast.success("Logged out successfully");
        },
        onSettled: () => {
            clearAuth();
            router.replace("/admin/login");
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: ChangePasswordData) =>
            handleActionResult(changePasswordAction(data)),
        onSuccess: () => {
            toast.success("Password changed successfully");
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Password change failed");
        },
    });

    return {
        loginMutation,
        logoutMutation,
        changePasswordMutation,
    };
}
