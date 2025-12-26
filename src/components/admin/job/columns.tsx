"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Job, JobStatus } from "@/types/job";
import {
    JOB_STATUS_COLORS,
    JOB_STATUS_LABELS,
    canCancelJob,
    canRetryJob,
    canDeleteJob,
} from "@/types/job";
import Link from "next/link";
import { formatDateTimeValue } from "@/lib/format";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Eye,
    XCircle,
    RefreshCw,
    Trash2,
} from "lucide-react";

interface JobColumnsProps {
    onCancel: (id: number) => void;
    onRetry: (id: number) => void;
    onDelete: (id: number) => void;
    isCancelPending?: boolean;
    isRetryPending?: boolean;
    isDeletePending?: boolean;
}

export function createJobColumns({
    onCancel,
    onRetry,
    onDelete,
    isCancelPending = false,
    isRetryPending = false,
    isDeletePending = false,
}: JobColumnsProps): ColumnDef<Job>[] {
    return [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => (
                <Link
                    href={`/admin/job/${row.original.id}`}
                    className="font-medium text-blue-600 hover:underline"
                >
                    #{row.getValue("id")}
                </Link>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <code className="text-sm bg-muted px-2 py-1 rounded">
                    {row.getValue("type")}
                </code>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as JobStatus;
                return (
                    <Badge className={JOB_STATUS_COLORS[status]}>
                        {JOB_STATUS_LABELS[status]}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "progress",
            header: "Progress",
            cell: ({ row }) => {
                const job = row.original;
                const progress = job.progress;
                const isRunning = job.status === "running";

                return (
                    <div className="w-32 space-y-1">
                        <Progress
                            value={progress}
                            className={isRunning ? "animate-pulse" : ""}
                        />
                        <div className="text-xs text-muted-foreground text-center">
                            {progress}%
                            {job.total_items > 0 && (
                                <span className="ml-1">
                                    ({job.processed_items}/{job.total_items})
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.getValue("priority") as number;
                return (
                    <Badge variant={priority >= 5 ? "default" : "secondary"}>
                        {priority}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "retry_count",
            header: "Retries",
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <span className="text-muted-foreground">
                        {job.retry_count}/{job.max_retries}
                    </span>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }) => {
                const date = row.getValue("created_at") as string;
                return (
                    <span className="text-sm text-muted-foreground">
                        {formatDateTimeValue(new Date(date))}
                    </span>
                );
            },
        },
        {
            accessorKey: "completed_at",
            header: "Completed",
            cell: ({ row }) => {
                const date = row.getValue("completed_at") as string | null;
                if (!date) {
                    return <span className="text-muted-foreground">-</span>;
                }
                return (
                    <span className="text-sm text-muted-foreground">
                        {formatDateTimeValue(new Date(date))}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const job = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/job/${job.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {canCancelJob(job) && (
                                <DropdownMenuItem
                                    onClick={() => onCancel(job.id)}
                                    disabled={isCancelPending}
                                    className="text-yellow-600"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Job
                                </DropdownMenuItem>
                            )}

                            {canRetryJob(job) && (
                                <DropdownMenuItem
                                    onClick={() => onRetry(job.id)}
                                    disabled={isRetryPending}
                                    className="text-blue-600"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Retry Job
                                </DropdownMenuItem>
                            )}

                            {canDeleteJob(job) && (
                                <DropdownMenuItem
                                    onClick={() => onDelete(job.id)}
                                    disabled={isDeletePending}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Job
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}