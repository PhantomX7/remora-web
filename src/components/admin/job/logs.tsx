"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { JobLog, LogLevel } from "@/types/job";
import { LOG_LEVEL_COLORS } from "@/types/job";
import { formatDateTimeValue } from "@/lib/format";
import {
    Bug,
    Info,
    AlertTriangle,
    XCircle,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface JobLogsProps {
    logs: JobLog[];
}

const LOG_LEVEL_ICONS: Record<LogLevel, React.ReactNode> = {
    debug: <Bug className="h-3 w-3" />,
    info: <Info className="h-3 w-3" />,
    warning: <AlertTriangle className="h-3 w-3" />,
    error: <XCircle className="h-3 w-3" />,
};

const LOG_LEVEL_BADGE_VARIANTS: Record<LogLevel, string> = {
    debug: "bg-gray-100 text-gray-700",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
};

export function JobLogs({ logs }: JobLogsProps) {
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

    const toggleLog = (id: number) => {
        const newExpanded = new Set(expandedLogs);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedLogs(newExpanded);
    };

    if (logs.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center py-8">
                        No logs available
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                    Logs ({logs.length} entries)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                        {logs.map((log) => {
                            const hasMetadata =
                                log.metadata &&
                                Object.keys(log.metadata).length > 0;
                            const isExpanded = expandedLogs.has(log.id);

                            return (
                                <div
                                    key={log.id}
                                    className={cn(
                                        "border rounded-lg p-3 text-sm",
                                        LOG_LEVEL_COLORS[log.level]
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex items-start gap-3",
                                            hasMetadata && "cursor-pointer"
                                        )}
                                        onClick={() =>
                                            hasMetadata && toggleLog(log.id)
                                        }
                                    >
                                        {hasMetadata && (
                                            <span className="mt-0.5">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </span>
                                        )}

                                        <Badge
                                            className={cn(
                                                "flex items-center gap-1 shrink-0",
                                                LOG_LEVEL_BADGE_VARIANTS[log.level]
                                            )}
                                        >
                                            {LOG_LEVEL_ICONS[log.level]}
                                            {log.level.toUpperCase()}
                                        </Badge>

                                        <div className="flex-1 min-w-0">
                                            <p className="wrap-break-word">
                                                {log.message}
                                            </p>
                                        </div>

                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {formatDateTimeValue(
                                                new Date(log.created_at)
                                            )}
                                        </span>
                                    </div>

                                    {hasMetadata && isExpanded && (
                                        <div className="mt-3 ml-7 p-2 bg-muted rounded text-xs">
                                            <pre className="whitespace-pre-wrap overflow-auto">
                                                {JSON.stringify(
                                                    log.metadata,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}