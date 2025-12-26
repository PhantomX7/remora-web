"use client";

import { createJobColumns } from "./columns";
import { useQueryClient } from "@tanstack/react-query";
import { FilterableDataTable } from "@/components/data-table/filterable-data-table";
import {
    FilterFieldConfig,
    SortFieldConfig,
    PaginationParams,
} from "@/types/pagination";
import {
    usePaginatedJobs,
    useJobMutations,
    JOB_QUERY_KEYS,
} from "@/hooks/admin/use-jobs";

const FILTER_FIELDS: FilterFieldConfig[] = [
    {
        field: "status",
        label: "Status",
        type: "ENUM",
        operators: ["eq"],
        options: [
            { value: "pending", label: "Pending" },
            { value: "running", label: "Running" },
            { value: "completed", label: "Completed" },
            { value: "failed", label: "Failed" },
            { value: "cancelled", label: "Cancelled" },
        ],
        placeholder: "Select status",
    },
    {
        field: "type",
        label: "Job Type",
        type: "STRING",
        operators: ["eq"],
        placeholder: "Enter job type",
    },
    {
        field: "priority",
        label: "Priority",
        type: "NUMBER",
        operators: ["eq", "gte", "lte"],
        placeholder: "Enter priority",
    },
    {
        field: "created_at",
        label: "Created Date",
        type: "DATE",
        operators: ["eq", "between", "gte", "lte"],
    },
];

const SORT_FIELDS: SortFieldConfig[] = [
    { field: "created_at", label: "Created Date", allowed: true },
    { field: "started_at", label: "Started Date", allowed: true },
    { field: "completed_at", label: "Completed Date", allowed: true },
    { field: "priority", label: "Priority", allowed: true },
    { field: "progress", label: "Progress", allowed: true },
];

interface JobListProps {
    params: PaginationParams;
}

export function JobList({ params }: JobListProps) {
    const queryClient = useQueryClient();
    const { data: jobs, isLoading, error } = usePaginatedJobs(params);
    const { cancelMutation, retryMutation, deleteMutation } = useJobMutations();

    const columns = createJobColumns({
        onCancel: (id: number) => cancelMutation.mutate(id),
        onRetry: (id: number) => retryMutation.mutate(id),
        onDelete: (id: number) => deleteMutation.mutate(id),
        isCancelPending: cancelMutation.isPending,
        isRetryPending: retryMutation.isPending,
        isDeletePending: deleteMutation.isPending,
    });

    return (
        <FilterableDataTable
            data={jobs?.data || []}
            meta={jobs?.meta || null}
            isLoading={isLoading}
            error={error}
            columns={columns}
            filterFields={FILTER_FIELDS}
            sortFields={SORT_FIELDS}
            onRefresh={() =>
                queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all })
            }
            globalSearchField="type"
            globalSearchPlaceholder="Search by job type"
        />
    );
}
