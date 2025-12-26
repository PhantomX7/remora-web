"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmButton } from "@/components/common/confirm-button";
import { JobProgress } from "./progress";
import { JobLogs } from "./logs";
import {
    useJobMutations,
    useJobWithPolling,
    useJobLogsWithPolling,
} from "@/hooks/admin/use-jobs";
import type { JobDetail as JobDetailType } from "@/types/job";
import {
    JOB_STATUS_COLORS,
    JOB_STATUS_LABELS,
    canCancelJob,
    canRetryJob,
    canDeleteJob,
    formatDuration,
} from "@/types/job";
import { formatDateTimeValue } from "@/lib/format";
import {
    XCircle,
    RefreshCw,
    Trash2,
    Clock,
    Calendar,
    AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface JobDetailProps {
    job: JobDetailType;
}

export function JobDetail({ job: initialJob }: JobDetailProps) {
    const router = useRouter();
    const isRunning = initialJob.status === "running";

    // Use polling for running jobs
    const { data: job } = useJobWithPolling(initialJob.id, isRunning);
    const currentJob = job || initialJob;

    const { data: logs } = useJobLogsWithPolling(
        currentJob.id,
        currentJob.status === "running",
        200
    );

    const { cancelMutation, retryMutation, deleteMutation } = useJobMutations();

    const handleDelete = () => {
        deleteMutation.mutate(currentJob.id, {
            onSuccess: () => router.push("/admin/job"),
        });
    };

    const handleRetry = () => {
        retryMutation.mutate(currentJob.id, {
            onSuccess: (result) => {
                if (result.data?.id) {
                    router.push(`/admin/job/${result.data.id}`);
                }
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">Job #{currentJob.id}</h2>
                        <Badge className={JOB_STATUS_COLORS[currentJob.status]}>
                            {JOB_STATUS_LABELS[currentJob.status]}
                        </Badge>
                    </div>
                    <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                        {currentJob.type}
                    </code>
                </div>

                <div className="flex items-center gap-2">
                    {canCancelJob(currentJob) && (
                        <ConfirmButton
                            onConfirm={() => cancelMutation.mutate(currentJob.id)}
                            description="This will cancel the job. Running jobs will be interrupted."
                            isLoading={cancelMutation.isPending}
                            variant="outline"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                        </ConfirmButton>
                    )}

                    {canRetryJob(currentJob) && (
                        <Button
                            variant="outline"
                            onClick={handleRetry}
                            disabled={retryMutation.isPending}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    )}

                    {canDeleteJob(currentJob) && (
                        <ConfirmButton
                            onConfirm={handleDelete}
                            description="This will permanently delete the job and its logs."
                            isLoading={deleteMutation.isPending}
                            variant="destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </ConfirmButton>
                    )}
                </div>
            </div>

            {/* Progress */}
            <JobProgress job={currentJob} />

            {/* Error Message */}
            {currentJob.error && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-800 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-sm text-red-700 whitespace-pre-wrap">
                            {currentJob.error}
                        </pre>
                    </CardContent>
                </Card>
            )}

            {/* Details Tabs */}
            <Tabs defaultValue="info">
                <TabsList>
                    <TabsTrigger value="info">Information</TabsTrigger>
                    <TabsTrigger value="payload">Payload</TabsTrigger>
                    <TabsTrigger value="result">Result</TabsTrigger>
                    <TabsTrigger value="logs">
                        Logs ({logs?.length || currentJob.logs?.length || 0})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <InfoItem
                                    label="Priority"
                                    value={currentJob.priority.toString()}
                                />
                                <InfoItem
                                    label="Retry Count"
                                    value={`${currentJob.retry_count} / ${currentJob.max_retries}`}
                                />
                                <InfoItem
                                    label="Progress"
                                    value={`${currentJob.progress}%`}
                                />
                                <InfoItem
                                    label="Items Processed"
                                    value={
                                        currentJob.total_items > 0
                                            ? `${currentJob.processed_items} / ${currentJob.total_items}`
                                            : "-"
                                    }
                                />
                                <InfoItem
                                    label="Created At"
                                    value={formatDateTimeValue(
                                        new Date(currentJob.created_at)
                                    )}
                                    icon={<Calendar className="h-4 w-4" />}
                                />
                                {currentJob.scheduled_at && (
                                    <InfoItem
                                        label="Scheduled For"
                                        value={formatDateTimeValue(
                                            new Date(currentJob.scheduled_at)
                                        )}
                                        icon={<Clock className="h-4 w-4" />}
                                    />
                                )}
                                {currentJob.started_at && (
                                    <InfoItem
                                        label="Started At"
                                        value={formatDateTimeValue(
                                            new Date(currentJob.started_at)
                                        )}
                                    />
                                )}
                                {currentJob.completed_at && (
                                    <InfoItem
                                        label="Completed At"
                                        value={formatDateTimeValue(
                                            new Date(currentJob.completed_at)
                                        )}
                                    />
                                )}
                                {currentJob.started_at && currentJob.completed_at && (
                                    <InfoItem
                                        label="Duration"
                                        value={formatDuration(
                                            (new Date(currentJob.completed_at).getTime() -
                                                new Date(currentJob.started_at).getTime()) /
                                                1000
                                        )}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payload" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            {currentJob.payload ? (
                                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                    {JSON.stringify(currentJob.payload, null, 2)}
                                </pre>
                            ) : (
                                <p className="text-muted-foreground">No payload</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="result" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            {currentJob.result ? (
                                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                    {JSON.stringify(currentJob.result, null, 2)}
                                </pre>
                            ) : (
                                <p className="text-muted-foreground">
                                    {currentJob.status === "completed"
                                        ? "No result data"
                                        : "Job has not completed yet"}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs" className="mt-4">
                    <JobLogs logs={logs || currentJob.logs || []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function InfoItem({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium flex items-center gap-2">
                {icon}
                {value}
            </p>
        </div>
    );
}