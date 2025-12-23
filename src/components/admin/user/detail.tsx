// @/components/admin/user/user-detail.tsx
"use client";

import { useUser } from "@/hooks/admin/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeValue } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertCircle,
    User as UserIcon,
    Mail,
    Phone,
    Shield,
    Calendar,
    Building2, // Added for Business Name
    IdCard, // Added for Username
} from "lucide-react";
import type { UserRole } from "@/types/user";
import { roleColors } from "@/lib/constants";

interface UserDetailProps {
    userId: number;
}

export function UserDetail({ userId }: UserDetailProps) {
    const { data: user, isLoading, error } = useUser(userId);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Increased skeleton count for new fields */}
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error || !user) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {error?.message || "User not found"}
                </AlertDescription>
            </Alert>
        );
    }

    const fields = [
        {
            icon: UserIcon,
            label: "Full Name",
            value: user.name || "Not provided",
        },
        {
            icon: Building2,
            label: "Business Name",
            value: user.business_name || "Not provided",
        },
        {
            icon: IdCard,
            label: "Username",
            value: user.username,
        },
        {
            icon: Mail,
            label: "Email",
            value: user.email || "Not provided",
        },
        {
            icon: Phone,
            label: "Phone",
            value: user.phone || "Not provided",
        },
        {
            icon: Shield,
            label: "Role",
            value: user.role,
            isRole: true,
        },
        {
            icon: null,
            label: "Status",
            value: user.is_active ? "Active" : "Inactive",
            isStatus: true,
        },
        {
            icon: Calendar,
            label: "Created At",
            value: formatDateTimeValue(new Date(user.created_at)),
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    User Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map((field, index) => (
                        <div key={index} className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                {field.icon && (
                                    <field.icon className="h-4 w-4" />
                                )}
                                {field.label}
                            </label>
                            <div>
                                {field.isRole ? (
                                    <Badge
                                        variant={
                                            roleColors[field.value as UserRole]
                                        }
                                        className="capitalize"
                                    >
                                        {field.value}
                                    </Badge>
                                ) : field.isStatus ? (
                                    <Badge
                                        variant={
                                            user.is_active
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {field.value}
                                    </Badge>
                                ) : (
                                    <p className="text-sm font-medium break-all">
                                        {field.value}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
