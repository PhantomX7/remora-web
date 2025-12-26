"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobStatusCounts } from "@/types/job";
import {
    Clock,
    Play,
    CheckCircle,
    XCircle,
    Ban,
} from "lucide-react";

interface StatsCardProps {
    stats?: JobStatusCounts;
    isLoading?: boolean;
}

export function JobStatsCards({ stats, isLoading }: StatsCardProps) {
    const cards = [
        {
            title: "Pending",
            value: stats?.pending || 0,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Running",
            value: stats?.running || 0,
            icon: Play,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Completed",
            value: stats?.completed || 0,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Failed",
            value: stats?.failed || 0,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            title: "Cancelled",
            value: stats?.cancelled || 0,
            icon: Ban,
            color: "text-gray-600",
            bgColor: "bg-gray-50",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <p className="text-2xl font-bold">{card.value}</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}