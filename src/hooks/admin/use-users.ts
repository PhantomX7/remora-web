// hooks/admin/use-users.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getUserAction,
    updateUserAction,
    getPaginatedUsersAction,
} from "@/actions/admin/user";
import { handleActionResult } from "@/lib/helpers";
import type { PaginationParams } from "@/types/pagination";
import type { ApiError } from "@/types/common";

const QUERY_KEY = ["users"] as const;

// Individual user query
export function useUser(id: number) {
    return useQuery({
        queryKey: [...QUERY_KEY, id],
        queryFn: async () => {
            const result = await handleActionResult(getUserAction(id));
            return result.data;
        },
        enabled: !!id,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Paginated users query
export function usePaginatedUsers(params: PaginationParams) {
    return useQuery({
        queryKey: [...QUERY_KEY, "paginated", params],
        queryFn: () => handleActionResult(getPaginatedUsersAction(params)),
        staleTime: 60 * 1000, // 1 minute
    });
}

// Separated mutations hook
export function useUserMutations() {
    const queryClient = useQueryClient();

    const invalidateAll = () => {
        queryClient.invalidateQueries({ 
            queryKey: QUERY_KEY,
        });
    };

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: FormData }) =>
            handleActionResult(updateUserAction(id, data)),
        onSuccess: () => {
            invalidateAll();
            toast.success("User updated successfully");
        },
        onError: (error: ApiError) => {
            toast.error(error.message);
        },
    });

    return {
        updateMutation,
    };
}