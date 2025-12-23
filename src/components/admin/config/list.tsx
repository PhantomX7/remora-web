// @/components/admin/config/config-list.tsx
"use client";

import { createConfigColumns } from "./columns";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { FilterableDataTable } from "@/components/data-table/filterable-data-table";
import {
    FilterFieldConfig,
    SortFieldConfig,
    PaginationParams,
} from "@/types/pagination";
import {
    usePaginatedConfigs,
    useConfigMutations,
} from "@/hooks/admin/use-configs";

const FILTER_FIELDS: FilterFieldConfig[] = [];

const SORT_FIELDS: SortFieldConfig[] = [
    { field: "key", label: "Key", allowed: true },
    { field: "created_at", label: "Created Date", allowed: true },
];

interface ConfigListProps {
    params: PaginationParams;
}

export function ConfigList({ params }: ConfigListProps) {
    const queryClient = useQueryClient();
    const { data: configs, isLoading, error } = usePaginatedConfigs(params);
    const { updateMutation } = useConfigMutations();

    const columns = useMemo(
        () =>
            createConfigColumns({
                onUpdate: (id: number, value: string) =>
                    updateMutation.mutate({ id, data: { value } }),
                isUpdatePending: updateMutation.isPending,
            }),
        [updateMutation]
    );

    return (
        <FilterableDataTable
            data={configs?.data || []}
            meta={configs?.meta || null}
            isLoading={isLoading}
            error={error}
            columns={columns}
            filterFields={FILTER_FIELDS}
            sortFields={SORT_FIELDS}
            onRefresh={() =>
                queryClient.invalidateQueries({
                    queryKey: ["configs"],
                    exact: false,
                })
            }
            globalSearchField="key"
            globalSearchPlaceholder="Search by config key"
        />
    );
}
