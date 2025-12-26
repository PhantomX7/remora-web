"use client";

import { use } from "react";
import { useJob } from "@/hooks/admin/use-jobs";
import { JobDetail } from "@admin/job/detail";
import { PageLayout } from "@admin/page-layout";
import { QueryStateHandler } from "@admin/query-state-handler";

export default function JobDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const jobId = parseInt(id);
    const { data, isLoading, error, refetch } = useJob(jobId);

    return (
        <PageLayout
            title={`Job #${jobId}`}
            backLink="/admin/job"
            backLabel="Back to Jobs"
        >
            <QueryStateHandler
                isLoading={isLoading}
                error={error}
                data={data}
                onRetry={refetch}
                backLink="/admin/job"
                loadingText="Loading job..."
            >
                <JobDetail job={data!} />
            </QueryStateHandler>
        </PageLayout>
    );
}