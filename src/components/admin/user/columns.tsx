"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { User, UserRole } from "@/types/user";
import Link from "next/link";
import { formatDateTimeValue } from "@/lib/format";
import { roleColors } from "@/lib/constants";

export function createUserColumns(): ColumnDef<User>[] {
    return [
        {
            accessorKey: "id",
            header: "ID",
            maxSize: 50,
            size: 50,
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("id")}</div>
            ),
        },
        {
            accessorKey: "username",
            header: "Username",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("username")}</div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="text-sm">{row.getValue("email")}</div>
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => (
                <div className="text-sm">{row.getValue("phone")}</div>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as UserRole;
                return (
                    <Badge variant={roleColors[role]}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }) => {
                const date = row.getValue("created_at") as string;
                return formatDateTimeValue(new Date(date));
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const user = row.original;

                return (
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/user/${user.id}`}>
                                Edit Role
                            </Link>
                        </Button>
                    </div>
                );
            },
        },
    ];
}
