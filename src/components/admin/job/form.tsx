"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { FormButton } from "@/components/form/form-button";
import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { FormNumberInput } from "@/components/form/form-number-input";
import { PayloadFields } from "./payload-fields";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useJobMutations, useJobTypes } from "@/hooks/admin/use-jobs";
import { AlertCircle, Info } from "lucide-react";

export function JobForm() {
    const router = useRouter();
    const { createMutation } = useJobMutations();
    const { data: jobTypes, isLoading: typesLoading } = useJobTypes();
    const [selectedType, setSelectedType] = useState<string>("");

    const { isPending, error } = createMutation;
    const fieldErrors = error?.error?.fields;

    const selectedTypeInfo = useMemo(
        () => jobTypes?.find((t) => t.type === selectedType),
        [jobTypes, selectedType]
    );

    const jobTypeOptions =
        jobTypes?.map((type) => ({
            label: type.display_name,
            value: type.type,
        })) || [];

    // Build default values including dynamic payload fields
    const defaultValues = useMemo(() => {
        const base: Record<string, any> = {
            type: "",
            priority: 0,
            max_retries: undefined,
            scheduled_at: "",
        };

        // Add payload field defaults
        if (selectedTypeInfo?.payload_fields) {
            selectedTypeInfo.payload_fields.forEach((field) => {
                base[`payload_${field.name}`] = field.default ?? "";
            });
        }

        return base;
    }, [selectedTypeInfo]);

    const form = useForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            // Build payload from dynamic fields
            const payload: Record<string, any> = {};

            if (selectedTypeInfo?.payload_fields) {
                selectedTypeInfo.payload_fields.forEach((field) => {
                    const fieldValue = value[`payload_${field.name}`];
                    if (
                        fieldValue !== undefined &&
                        fieldValue !== "" &&
                        fieldValue !== null
                    ) {
                        // Convert to proper type
                        if (field.type === "number") {
                            payload[field.name] = Number(fieldValue);
                        } else if (field.type === "boolean") {
                            payload[field.name] = Boolean(fieldValue);
                        } else {
                            payload[field.name] = fieldValue;
                        }
                    }
                });
            }

            // Convert datetime-local to RFC3339/ISO format
            let scheduledAt: string | undefined;
            if (value.scheduled_at) {
                const date = new Date(value.scheduled_at);
                scheduledAt = date.toISOString();
            }

            const data = {
                type: value.type,
                payload: Object.keys(payload).length > 0 ? payload : undefined,
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

    // Reset payload fields when job type changes
    const handleTypeChange = (newType: string) => {
        setSelectedType(newType);

        // Clear old payload fields
        const currentValues = form.state.values;
        Object.keys(currentValues).forEach((key) => {
            if (key.startsWith("payload_")) {
                form.setFieldValue(key, undefined);
            }
        });

        // Set new defaults
        const newTypeInfo = jobTypes?.find((t) => t.type === newType);
        if (newTypeInfo?.payload_fields) {
            newTypeInfo.payload_fields.forEach((field) => {
                if (field.default !== undefined) {
                    form.setFieldValue(`payload_${field.name}`, field.default);
                }
            });
        }
    };

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
                        {/* Job Type Selection */}
                        <form.Field
                            name="type"
                            listeners={{
                                onChange: ({ value }) => {
                                    handleTypeChange(value);
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

                        {/* Dynamic Payload Fields */}
                        {selectedType && (
                            <>
                                <Separator />
                                <PayloadFields
                                    jobType={selectedTypeInfo}
                                    form={form}
                                    disabled={isPending}
                                    fieldErrors={fieldErrors}
                                />
                            </>
                        )}

                        <Separator />

                        {/* Job Options */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium">
                                Job Options
                            </Label>
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
                                            description="Higher priority jobs run first (0-100)"
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
                                            description="Override default max retries"
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
                                        description="Optional: Schedule job for future execution"
                                    />
                                )}
                            </form.Field>
                        </div>

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
                            {selectedTypeInfo.payload_fields &&
                                selectedTypeInfo.payload_fields.length > 0 && (
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Required Fields
                                        </Label>
                                        <p className="font-medium">
                                            {selectedTypeInfo.payload_fields
                                                .filter((f) => f.required)
                                                .map((f) => f.label)
                                                .join(", ") || "None"}
                                        </p>
                                    </div>
                                )}
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

function formatTimeout(nanoseconds: number): string {
    const minutes = nanoseconds / (1000 * 1000 * 1000 * 60);
    if (minutes >= 60) {
        const hours = minutes / 60;
        return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}
