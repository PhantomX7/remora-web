"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormButton } from "@/components/form/form-button";
import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { FormTextarea } from "@/components/form/form-textarea";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobMutations, useJobTypes } from "@/hooks/admin/use-jobs";
import { AlertCircle, Info } from "lucide-react";
import { FormNumberInput } from "@/components/form/form-number-input";

const jobSchema = z.object({
    type: z.string().min(1, "Job type is required"),
    payload: z.string().refine(
        (val) => {
            if (!val || val.trim() === "") return true;
            try {
                JSON.parse(val);
                return true;
            } catch {
                return false;
            }
        },
        { message: "Payload must be valid JSON" }
    ),
    priority: z.coerce.number().int().min(0).max(100),
    max_retries: z.coerce.number().int().min(0).max(10).optional(),
    scheduled_at: z.string().optional(),
});

export function JobForm() {
    const router = useRouter();
    const { createMutation } = useJobMutations();
    const { data: jobTypes, isLoading: typesLoading } = useJobTypes();
    const [selectedType, setSelectedType] = useState<string>("");

    const { isPending, error } = createMutation;
    const fieldErrors = error?.error?.fields;

    const selectedTypeInfo = jobTypes?.find((t) => t.type === selectedType);

    const jobTypeOptions =
        jobTypes?.map((type) => ({
            label: type.display_name,
            value: type.type,
        })) || [];

    const form = useForm({
        defaultValues: {
            type: "",
            payload: "",
            priority: 0,
            max_retries: undefined as number | undefined,
            scheduled_at: "",
        },
        validators: {
            onSubmit: jobSchema as any,
        },
        onSubmit: async ({ value }) => {
            let payload: Record<string, unknown> | undefined;

            if (value.payload && value.payload.trim() !== "") {
                try {
                    payload = JSON.parse(value.payload);
                } catch {
                    return;
                }
            }

            // Convert datetime-local to RFC3339/ISO format
            let scheduledAt: string | undefined;
            if (value.scheduled_at) {
                const date = new Date(value.scheduled_at);
                scheduledAt = date.toISOString();
            }

            const data = {
                type: value.type,
                payload,
                // Ensure numbers are actually numbers, not strings
                priority: Number(value.priority) || 0,
                max_retries:
                    value.max_retries !== undefined &&
                    value.max_retries !== null
                        ? Number(value.max_retries)
                        : undefined,
                scheduled_at: scheduledAt,
            };

            createMutation.mutate(data, {
                onSuccess: (result) => {
                    router.push(`/admin/job/${result.data?.id}`);
                },
            });
        },
    });

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-6"
                >
                    <FieldGroup>
                        {/* Use listeners pattern like PostForm */}
                        <form.Field
                            name="type"
                            listeners={{
                                onChange: ({ value }) => {
                                    setSelectedType(value);
                                },
                            }}
                        >
                            {(field) => (
                                <FormSelect
                                    field={field}
                                    label="Job Type"
                                    placeholder={
                                        typesLoading
                                            ? "Loading job types..."
                                            : "Select job type"
                                    }
                                    options={jobTypeOptions}
                                    required
                                    error={fieldErrors?.type}
                                    disabled={isPending || typesLoading}
                                />
                            )}
                        </form.Field>

                        <form.Field name="payload">
                            {(field) => (
                                <FormTextarea
                                    field={field}
                                    label="Payload (JSON)"
                                    placeholder='{"key": "value"}'
                                    rows={8}
                                    className="font-mono text-sm"
                                    error={fieldErrors?.payload}
                                    disabled={isPending}
                                />
                            )}
                        </form.Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <form.Field name="priority">
                                {(field) => (
                                    <FormNumberInput
                                        field={field}
                                        label="Priority"
                                        min={0}
                                        max={100}
                                        placeholder="0"
                                        error={fieldErrors?.priority}
                                        disabled={isPending}
                                    />
                                )}
                            </form.Field>

                            <form.Field name="max_retries">
                                {(field) => (
                                    <FormNumberInput
                                        field={field}
                                        label="Max Retries"
                                        min={0}
                                        max={10}
                                        placeholder={
                                            selectedTypeInfo
                                                ? `Default: ${selectedTypeInfo.max_retries}`
                                                : "Default from job type"
                                        }
                                        error={fieldErrors?.max_retries}
                                        disabled={isPending}
                                    />
                                )}
                            </form.Field>
                        </div>

                        <form.Field name="scheduled_at">
                            {(field) => (
                                <FormInput
                                    field={field}
                                    label="Schedule For"
                                    type="datetime-local"
                                    error={fieldErrors?.scheduled_at}
                                    disabled={isPending}
                                />
                            )}
                        </form.Field>

                        <Field>
                            <FormButton
                                type="submit"
                                className="w-full sm:w-auto"
                                isLoading={isPending}
                                loadingText="Creating Job..."
                            >
                                Create Job
                            </FormButton>
                        </Field>
                    </FieldGroup>
                </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
                {selectedTypeInfo && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Job Type Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <Label className="text-muted-foreground">
                                    Display Name
                                </Label>
                                <p className="font-medium">
                                    {selectedTypeInfo.display_name}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Description
                                </Label>
                                <p>{selectedTypeInfo.description}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Default Max Retries
                                </Label>
                                <p className="font-medium">
                                    {selectedTypeInfo.max_retries}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Timeout
                                </Label>
                                <p className="font-medium">
                                    {selectedTypeInfo.timeout}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Jobs are processed in order of priority. Higher priority
                        jobs (closer to 100) are executed first.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
