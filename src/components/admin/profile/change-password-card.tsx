// @/components/admin/profile/change-password-card.tsx
"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FormButton } from "@/components/form/form-button";
import { FormInput } from "@/components/form/form-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {  FieldGroup } from "@/components/ui/field";
import { useAdminAuthMutations } from "@/hooks/admin/use-auth";
import { ChangePasswordData } from "@/types/auth";
import { Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

const changePasswordSchema = z
    .object({
        old_password: z.string().min(1, "Current password is required."),
        new_password: z
            .string()
            .min(8, "New password must be at least 8 characters long."),
        confirm_password: z.string().min(1, "Password confirmation is required."),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    });

export function ChangePasswordCard() {
    const { changePasswordMutation } = useAdminAuthMutations();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const passwordForm = useForm({
        defaultValues: {
            old_password: "",
            new_password: "",
            confirm_password: "",
        },
        validators: {
            onSubmit: changePasswordSchema as any,
        },
        onSubmit: async ({ value }) => {
            const { confirm_password, ...passwordData }: ChangePasswordData & { 
                confirm_password: string 
            } = value;
            
            changePasswordMutation.mutate(passwordData, {
                onSuccess: () => {
                    passwordForm.reset();
                    setShowPasswordForm(false);
                    setShowSuccess(true);
                    // Hide success message after 5 seconds
                    setTimeout(() => setShowSuccess(false), 5000);
                },
            });
        },
    });

    const fieldErrors = (changePasswordMutation.error as any)?.error?.fields;
    const { isPending } = changePasswordMutation;

    const handleCancel = () => {
        setShowPasswordForm(false);
        passwordForm.reset();
        changePasswordMutation.reset(); // Clear any errors
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure
                            </CardDescription>
                        </div>
                    </div>
                    {!showPasswordForm && (
                        <Button
                            variant="outline"
                            onClick={() => setShowPasswordForm(true)}
                        >
                            Change Password
                        </Button>
                    )}
                </div>
            </CardHeader>

            {showSuccess && (
                <CardContent className="pt-0">
                    <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-700 dark:text-green-300">
                            Your password has been changed successfully!
                        </AlertDescription>
                    </Alert>
                </CardContent>
            )}

            {showPasswordForm && (
                <CardContent className={showSuccess ? "" : "pt-0"}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            passwordForm.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        <FieldGroup>
                            <passwordForm.Field name="old_password">
                                {(field) => (
                                    <FormInput
                                        field={field}
                                        label="Current Password"
                                        type="password"
                                        placeholder="Enter your current password"
                                        required
                                        error={fieldErrors?.old_password}
                                        disabled={isPending}
                                    />
                                )}
                            </passwordForm.Field>

                            <passwordForm.Field name="new_password">
                                {(field) => (
                                    <FormInput
                                        field={field}
                                        label="New Password"
                                        type="password"
                                        placeholder="Enter your new password (min. 8 characters)"
                                        required
                                        error={fieldErrors?.new_password}
                                        disabled={isPending}
                                    />
                                )}
                            </passwordForm.Field>

                            <passwordForm.Field name="confirm_password">
                                {(field) => (
                                    <FormInput
                                        field={field}
                                        label="Confirm New Password"
                                        type="password"
                                        placeholder="Confirm your new password"
                                        required
                                        disabled={isPending}
                                    />
                                )}
                            </passwordForm.Field>

                            <div className="flex gap-3 pt-2">
                                <FormButton
                                    type="submit"
                                    isLoading={isPending}
                                    loadingText="Changing Password..."
                                >
                                    Update Password
                                </FormButton>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            )}
        </Card>
    );
}