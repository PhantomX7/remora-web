// @/components/admin/config/columns.tsx
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import type { Config } from "@/types/config";

interface CreateConfigColumnsProps {
    onUpdate: (id: number, value: string) => void;
    isUpdatePending: boolean;
}

// Extracted as a proper React component
interface EditableCellProps {
    initialValue: string;
    onSave: (value: string) => void;
    isUpdatePending: boolean;
}

function EditableCell({
    initialValue,
    onSave,
    isUpdatePending,
}: EditableCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);

    const handleSave = () => {
        onSave(value);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setValue(initialValue);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="max-w-[300px]"
                    autoFocus
                />
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isUpdatePending}
                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div
            className="max-w-[300px] cursor-pointer rounded px-2 py-1 hover:bg-accent/50"
            onClick={() => setIsEditing(true)}
        >
            {initialValue || (
                <span className="text-muted-foreground">Click to edit</span>
            )}
        </div>
    );
}

export function createConfigColumns({
    onUpdate,
    isUpdatePending,
}: CreateConfigColumnsProps): ColumnDef<Config>[] {
    return [
        {
            accessorKey: "key",
            header: "Key",
            cell: ({ row }) => (
                <div className="font-medium">
                    <Badge variant="outline">{row.getValue("key")}</Badge>
                </div>
            ),
        },
        {
            accessorKey: "value",
            header: "Value",
            cell: ({ row }) => (
                <EditableCell
                    initialValue={row.getValue("value") as string}
                    onSave={(value) => onUpdate(row.original.id, value)}
                    isUpdatePending={isUpdatePending}
                />
            ),
        },
    ];
}
