"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatsCards } from "./stats-card";
import { RunningJobs } from "./running-jobs";
import { useJobDashboard } from "@/hooks/admin/use-jobs";
import { formatDuration } from "@/types/job";
import {
    BarChart3,
    TrendingUp,
    Clock,
} from "lucide-react";

export function JobDashboard() {
    const {
        stats,
        statsLoading,
        runningJobs,
        runningJobsLoading,
        jobTypes,
        jobTypesLoading,
    } = useJobDashboard();

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <JobStatsCards stats={stats?.total} isLoading={statsLoading} />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Running Jobs */}
                <RunningJobs jobs={runningJobs} isLoading={runningJobsLoading} />

                {/* Job Types Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Job Types Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : stats && Object.keys(stats.by_type).length > 0 ? (
                            <div className="space-y-4">
                                {Object.values(stats.by_type).map((typeStat) => (
                                    <div
                                        key={typeStat.type}
                                        className="border rounded-lg p-4 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">
                                                    {typeStat.display_name}
                                                </h4>
                                                <code className="text-xs text-muted-foreground">
                                                    {typeStat.type}
                                                </code>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <TrendingUp className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        {typeStat.success_rate.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    success rate
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                            <div>
                                                <p className="font-medium text-yellow-600">
                                                    {typeStat.pending}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Pending
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-blue-600">
                                                    {typeStat.running}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Running
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-600">
                                                    {typeStat.completed}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Completed
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-red-600">
                                                    {typeStat.failed}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Failed
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                Avg Duration:{" "}
                                                {formatDuration(typeStat.avg_duration_seconds)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No job statistics available
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Registered Job Types */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Registered Job Types</CardTitle>
                </CardHeader>
                <CardContent>
                    {jobTypesLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    ) : jobTypes && jobTypes.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {jobTypes.map((type) => (
                                <div
                                    key={type.type}
                                    className="border rounded-lg p-4 space-y-2"
                                >
                                    <div>
                                        <h4 className="font-medium">
                                            {type.display_name}
                                        </h4>
                                        <code className="text-xs text-muted-foreground">
                                            {type.type}
                                        </code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {type.description}
                                    </p>
                                    <div className="flex gap-4 text-xs text-muted-foreground">
                                        <span>Retries: {type.max_retries}</span>
                                        <span>Timeout: {type.timeout}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No job types registered
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}