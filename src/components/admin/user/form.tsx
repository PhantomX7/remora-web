// @/components/admin/user/user-form.tsx
"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { FormButton } from "@/components/form/form-button";
import { FormSelect } from "@/components/form/form-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { getChangedValues } from "@/lib/form-utils";
import { User, UserRole } from "@/types/user";
import { useUserMutations } from "@/hooks/admin/use-users";

const userSchema = z.object({
    role: z.enum(["user", "reseller"]),
});

interface UserFormProps {
    initialData: User | undefined;
    userId: number;
}

const USER_ROLE_OPTIONS = [
    { value: "user", label: "User" },
    { value: "reseller", label: "Reseller" },
];

export function UserForm({ initialData, userId }: UserFormProps) {
    const router = useRouter();
    const { updateMutation } = useUserMutations();

    const { isPending, error } = updateMutation;
    const fieldErrors = error?.error?.fields;

    const form = useForm({
        defaultValues: {
            role: initialData?.role as UserRole,
        },
        validators: {
            onSubmit: userSchema as any,
        },
        onSubmit: async ({ value }) => {
            const data = getChangedValues(value, initialData);

            const formData = new FormData();

            Object.entries(data).forEach(([key, val]) => {
                if (val !== null && val !== undefined) {
                    formData.append(key, val as any);
                }
            });

            updateMutation.mutate(
                { id: userId, data: formData },
                { onSuccess: () => router.push("/admin/user") }
            );
        },
    });

    // Don't show form if user is admin
    if (["admin", "root"].includes(initialData ? initialData.role : "")) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Role Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Admin users cannot have their role modified.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-6"
                >
                    <FieldGroup>
                        <form.Field name="role">
                            {(field) => (
                                <FormSelect
                                    field={field}
                                    label="User Role"
                                    placeholder="Select a role"
                                    options={USER_ROLE_OPTIONS}
                                    required
                                    error={fieldErrors?.role}
                                    disabled={isPending}
                                />
                            )}
                        </form.Field>

                        <Field>
                            <FormButton
                                type="submit"
                                className="w-full"
                                isLoading={isPending}
                                loadingText="Updating..."
                            >
                                Update User Role
                            </FormButton>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
