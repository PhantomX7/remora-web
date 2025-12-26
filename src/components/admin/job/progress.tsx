"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Job } from "@/types/job";
import { Loader2 } from "lucide-react";

interface JobProgressProps {
    job: Job;
}

export function JobProgress({ job }: JobProgressProps) {
    const isRunning = job.status === "running";
    const progress = job.progress;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isRunning && (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            )}
                            <span className="font-medium">
                                {isRunning ? "Processing..." : "Progress"}
                            </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {progress}%
                            {job.total_items > 0 && (
                                <span className="ml-2">
                                    ({job.processed_items} / {job.total_items} items)
                                </span>
                            )}
                        </span>
                    </div>

                    <Progress
                        value={progress}
                        className={isRunning ? "animate-pulse" : ""}
                    />

                    {job.progress_message && (
                        <p className="text-sm text-muted-foreground">
                            {job.progress_message}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}