// actions/admin/user.ts
"use server";

import { revalidateTag } from "next/cache";
import type { User } from "@/types/user";
import type { ApiResponse, ActionResponse } from "@/types/common";
import type { PaginationParams } from "@/types/pagination";
import { adminApiClient } from "@/lib/api";
import { ADMIN_API_ENDPOINTS } from "@/lib/constants";
import { buildBackendUrl } from "@/lib/pagination/serverUtils";
import { handleApiError, extractApiData } from "@/lib/helpers";

export async function getPaginatedUsersAction(
    params: PaginationParams
): Promise<ActionResponse<User[]>> {
    try {
        const response = await adminApiClient().get<ApiResponse<User[]>>(
            buildBackendUrl(ADMIN_API_ENDPOINTS.USER.GENERAL, params)
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to fetch paginated users");
    }
}

export async function getUserAction(id: number): Promise<ActionResponse<User>> {
    try {
        const response = await adminApiClient().get<ApiResponse<User>>(
            ADMIN_API_ENDPOINTS.USER.DETAIL(id)
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to fetch user");
    }
}

export async function updateUserAction(
    id: number,
    userData: FormData
): Promise<ActionResponse<User>> {
    try {
        const response = await adminApiClient().patch<ApiResponse<User>>(
            ADMIN_API_ENDPOINTS.USER.DETAIL(id),
            userData
        );
        revalidateTag("users", "max");
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to update user");
    }
}
