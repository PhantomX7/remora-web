// @/components/admin/user/user-list.tsx
"use client";

import { createUserColumns } from "./columns";
import { usePaginatedUsers } from "@/hooks/admin/use-users";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FilterableDataTable } from "@/components/data-table/filterable-data-table";
import {
    FilterFieldConfig,
    SortFieldConfig,
    PaginationParams,
} from "@/types/pagination";

const FILTER_FIELDS: FilterFieldConfig[] = [
    {
        field: "username",
        label: "Username",
        type: "STRING",
        operators: ["like", "eq"],
        placeholder: "Enter username...",
    },
    {
        field: "email",
        label: "Email",
        type: "STRING",
        operators: ["like", "eq"],
        placeholder: "Enter email...",
    },
    {
        field: "role",
        label: "Role",
        type: "ENUM",
        operators: ["eq"],
        options: [
            { value: "admin", label: "Admin" },
            { value: "reseller", label: "Reseller" },
            { value: "user", label: "User" },
        ],
        placeholder: "Select role",
    },
    {
        field: "created_at",
        label: "Created Date",
        type: "DATE",
        operators: ["eq", "between"],
    },
];

const SORT_FIELDS: SortFieldConfig[] = [
    { field: "id", label: "ID", allowed: true },
    { field: "username", label: "Username", allowed: true },
    { field: "email", label: "Email", allowed: true },
    { field: "created_at", label: "Created Date", allowed: true },
];

interface UserListProps {
    params: PaginationParams;
}

export function UserList({ params }: UserListProps) {
    const queryClient = useQueryClient();
    const { data: users, isLoading, error } = usePaginatedUsers(params);

    const columns = useMemo(() => createUserColumns(), []);

    return (
        <FilterableDataTable
            data={users?.data || []}
            meta={users?.meta || null}
            isLoading={isLoading}
            error={error}
            columns={columns}
            filterFields={FILTER_FIELDS}
            sortFields={SORT_FIELDS}
            onRefresh={() =>
                queryClient.invalidateQueries({ queryKey: ["users"] })
            }
            globalSearchField="username"
            globalSearchPlaceholder="Search by username"
        />
    );
}
