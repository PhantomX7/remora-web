// @/components/admin/profile/profile-info-card.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/admin/use-auth";
import { User, Mail, Shield, Phone } from "lucide-react";

export function ProfileInfoCard() {
    const { user, isLoading } = useAdminAuth();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!user) return null;

    const fields = [
        {
            icon: User,
            label: "Username",
            value: user.username,
            span: 1,
        },
        {
            icon: Shield,
            label: "Role",
            value: user.role,
            isRole: true,
            span: 1,
        },
        {
            icon: Mail,
            label: "Email",
            value: user.email,
            span: 2,
        },
        {
            icon: Phone,
            label: "Phone",
            value: user.phone,
            span: 2,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map((field, index) => (
                        <div
                            key={index}
                            className={`space-y-2 ${
                                field.span === 2 ? "md:col-span-2" : ""
                            }`}
                        >
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <field.icon className="h-4 w-4" />
                                {field.label}
                            </label>
                            <div>
                                {field.isRole ? (
                                    <Badge
                                        variant="destructive"
                                        className="text-sm font-medium capitalize"
                                    >
                                        {field.value}
                                    </Badge>
                                ) : (
                                    <p className="text-base font-medium text-foreground">
                                        {field.value || (
                                            <span className="text-muted-foreground italic">
                                                Not provided
                                            </span>
                                        )}
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