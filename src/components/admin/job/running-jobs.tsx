"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Job } from "@/types/job";
import Link from "next/link";
import { formatDateTimeValue } from "@/lib/format";
import { Eye, Loader2 } from "lucide-react";

interface RunningJobsProps {
    jobs: Job[];
    isLoading?: boolean;
}

export function RunningJobs({ jobs, isLoading }: RunningJobsProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running Jobs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Running Jobs ({jobs.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {jobs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No jobs currently running
                    </p>
                ) : (
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="border rounded-lg p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                #{job.id}
                                            </Badge>
                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                {job.type}
                                            </code>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={`/admin/job/${job.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>{job.progress_message || "Processing..."}</span>
                                            <span>{job.progress}%</span>
                                        </div>
                                        <Progress
                                            value={job.progress}
                                            className="animate-pulse"
                                        />
                                        {job.total_items > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {job.processed_items} / {job.total_items} items
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Priority: {job.priority}</span>
                                        <span>
                                            Started:{" "}
                                            {job.started_at
                                                ? formatDateTimeValue(
                                                      new Date(job.started_at)
                                                  )
                                                : "-"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}