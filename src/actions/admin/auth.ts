// actions/admin/auth.ts
"use server";

import { revalidatePath } from "next/cache";
import {
    setAuthTokens,
    clearAuthTokens,
    getRefreshToken,
    getAccessToken,
} from "@/lib/auth";
import { adminApiClient } from "@/lib/api"; // Use explicit admin client
import type {
    LoginCredentials,
    AuthTokens,
    ChangePasswordData,
} from "@/types/auth";
import type { User } from "@/types/user";
import type { ApiResponse, ActionResponse } from "@/types/common";
import { ADMIN_API_ENDPOINTS } from "@/lib/constants";
import {
    handleApiError,
    handleApiSuccess,
    extractApiData,
} from "@/lib/helpers";

export async function loginAction(
    req: LoginCredentials
): Promise<ActionResponse<User>> {
    try {
        const response = await adminApiClient().post<ApiResponse<AuthTokens>>(
            ADMIN_API_ENDPOINTS.AUTH.LOGIN,
            req
        );

        // Pass "admin" scope
        await setAuthTokens("admin", response.data);

        revalidatePath("/admin", "layout");
        return handleApiSuccess();
    } catch (error) {
        return handleApiError(error, "Login failed");
    }
}

export async function getMeAction(): Promise<ActionResponse<User>> {
    try {
        const response = await adminApiClient().get<ApiResponse<User>>(
            ADMIN_API_ENDPOINTS.AUTH.ME
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to get user info");
    }
}

export async function changePasswordAction(
    req: ChangePasswordData
): Promise<ActionResponse<string>> {
    try {
        const response = await adminApiClient().post<ApiResponse<string>>(
            ADMIN_API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
            req
        );

        revalidatePath("/admin", "layout");

        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Password change failed");
    }
}

export async function logoutAction(): Promise<ActionResponse> {
    try {
        const refresh_token = await getRefreshToken("admin"); // Pass scope
        const access_token = await getAccessToken("admin"); // Pass scope

        if (refresh_token) {
            adminApiClient()
                .post(
                    ADMIN_API_ENDPOINTS.AUTH.LOGOUT,
                    { refresh_token },
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    }
                )
                .catch(() => {});
        }

        revalidatePath("/admin", "layout");
        return handleApiSuccess();
    } catch (error) {
        return handleApiError(error, "Logout failed");
    } finally {
        await clearAuthTokens("admin"); // Pass scope
    }
}
