// app/admin/login/page.tsx
"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { FormInput } from "@/components/form/form-input";
import { FormButton } from "@/components/form/form-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useAdminAuthMutations } from "@/hooks/admin/use-auth";

const loginSchema = z.object({
    username: z.string().min(4, "Username must be at least 4 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
    const { loginMutation } = useAdminAuthMutations();

    const form = useForm({
        defaultValues: {
            username: "",
            password: "",
        },
        validators: {
            onSubmit: loginSchema,
        },
        onSubmit: ({ value }) => loginMutation.mutate(value),
    });

    const isDisabled = loginMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        remora Admin
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup>
                            <form.Field name="username">
                                {(field) => (
                                    <FormInput
                                        field={field}
                                        label="Username"
                                        placeholder="Enter your username"
                                        required
                                        disabled={isDisabled}
                                    />
                                )}
                            </form.Field>

                            <form.Field name="password">
                                {(field) => (
                                    <FormInput
                                        field={field}
                                        label="Password"
                                        type="password"
                                        placeholder="Enter your password"
                                        required
                                        disabled={isDisabled}
                                    />
                                )}
                            </form.Field>

                            <FormButton
                                type="submit"
                                className="w-full"
                                isLoading={loginMutation.isPending}
                                loadingText="Signing in..."
                            >
                                Login
                            </FormButton>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}