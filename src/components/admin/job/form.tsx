"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";

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
import type { JobType, PayloadField } from "@/types/job";
import { AlertCircle, Info } from "lucide-react";

// Helper: Get default value based on field type
function getFieldDefault(field: PayloadField): any {
    if (field.default !== undefined) return field.default;

    switch (field.type) {
        case "string":
        case "select":
            return "";
        case "number":
            return "";
        case "boolean":
            return false;
        default:
            return "";
    }
}

// Helper: Build payload from form values
function buildPayload(
    values: Record<string, any>,
    payloadFields?: PayloadField[]
): Record<string, any> | undefined {
    if (!payloadFields?.length) return undefined;

    const payload: Record<string, any> = {};

    payloadFields.forEach((field) => {
        const value = values[`payload_${field.name}`];

        // Skip empty values
        if (value === undefined || value === "" || value === null) return;

        // Convert to proper type
        switch (field.type) {
            case "number":
                payload[field.name] = Number(value);
                break;
            case "boolean":
                payload[field.name] = Boolean(value);
                break;
            default:
                payload[field.name] = value;
        }
    });

    return Object.keys(payload).length > 0 ? payload : undefined;
}

export function JobForm() {
    const router = useRouter();
    const { createMutation } = useJobMutations();
    const { data: jobTypes, isLoading: typesLoading } = useJobTypes();
    const [selectedType, setSelectedType] = useState<string>("");

    const { isPending, error } = createMutation;
    const fieldErrors = error?.error?.fields;

    // Memoized selected type info
    const selectedTypeInfo = useMemo(
        () => jobTypes?.find((t) => t.type === selectedType),
        [jobTypes, selectedType]
    );

    // Memoized job type options
    const jobTypeOptions = useMemo(
        () =>
            jobTypes?.map((type) => ({
                label: type.display_name,
                value: type.type,
            })) || [],
        [jobTypes]
    );

    // Initialize payload fields with proper defaults
    const initializePayloadFields = useCallback(
        (typeInfo: JobType | undefined): Record<string, any> => {
            const fields: Record<string, any> = {};
            typeInfo?.payload_fields?.forEach((field) => {
                fields[`payload_${field.name}`] = getFieldDefault(field);
            });
            return fields;
        },
        []
    );

    const form = useForm({
        defaultValues: {
            type: "",
            priority: 0,
            max_retries: "" as number | "",
            scheduled_at: "",
            // Payload fields will be added dynamically
        } as Record<string, any>,
        onSubmit: async ({ value }) => {
            const scheduledAt = value.scheduled_at
                ? new Date(value.scheduled_at).toISOString()
                : undefined;

            const data = {
                type: value.type,
                payload: buildPayload(value, selectedTypeInfo?.payload_fields),
                priority: Number(value.priority) || 0,
                max_retries:
                    value.max_retries !== ""
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

    // Handle job type change
    const handleTypeChange = useCallback(
        (newType: string) => {
            setSelectedType(newType);

            // Clear all existing payload fields
            Object.keys(form.state.values).forEach((key) => {
                if (key.startsWith("payload_")) {
                    form.deleteField(key);
                }
            });

            // Initialize new payload fields with defaults
            const newTypeInfo = jobTypes?.find((t) => t.type === newType);
            const newFields = initializePayloadFields(newTypeInfo);

            Object.entries(newFields).forEach(([key, value]) => {
                form.setFieldValue(key, value);
            });
        },
        [jobTypes, form, initializePayloadFields]
    );

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
                                onChange: ({ value }) =>
                                    handleTypeChange(value),
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
                        <JobOptions
                            form={form}
                            selectedTypeInfo={selectedTypeInfo}
                            fieldErrors={fieldErrors}
                            disabled={isPending}
                        />

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
            <JobTypeSidebar jobType={selectedTypeInfo} />
        </div>
    );
}

// Extracted: Job Options Section
interface JobOptionsProps {
    form: any;
    selectedTypeInfo: JobType | undefined;
    fieldErrors?: Record<string, string>;
    disabled: boolean;
}

function JobOptions({
    form,
    selectedTypeInfo,
    fieldErrors,
    disabled,
}: JobOptionsProps) {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium">Job Options</Label>
            <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="priority">
                    {(field: any) => (
                        <FormNumberInput
                            field={field}
                            label="Priority"
                            min={0}
                            max={100}
                            placeholder="0"
                            error={fieldErrors?.priority}
                            disabled={disabled}
                            description="Higher priority jobs run first (0-100)"
                        />
                    )}
                </form.Field>

                <form.Field name="max_retries">
                    {(field: any) => (
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
                            disabled={disabled}
                            description="Override default max retries"
                        />
                    )}
                </form.Field>
            </div>

            <form.Field name="scheduled_at">
                {(field: any) => (
                    <FormInput
                        field={field}
                        label="Schedule For"
                        type="datetime-local"
                        error={fieldErrors?.scheduled_at}
                        disabled={disabled}
                        description="Optional: Schedule job for future execution"
                    />
                )}
            </form.Field>
        </div>
    );
}

// Extracted: Job Type Sidebar
interface JobTypeSidebarProps {
    jobType: JobType | undefined;
}

function JobTypeSidebar({ jobType }: JobTypeSidebarProps) {
    const requiredFields = useMemo(
        () =>
            jobType?.payload_fields
                ?.filter((f) => f.required)
                .map((f) => f.label) || [],
        [jobType]
    );

    return (
        <div className="space-y-4">
            {jobType && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Job Type Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <InfoRow
                            label="Display Name"
                            value={jobType.display_name}
                        />
                        <InfoRow
                            label="Description"
                            value={jobType.description}
                        />
                        <InfoRow
                            label="Default Max Retries"
                            value={jobType.max_retries}
                        />
                        <InfoRow
                            label="Timeout"
                            value={jobType.timeout}
                        />
                        {requiredFields.length > 0 && (
                            <InfoRow
                                label="Required Fields"
                                value={requiredFields.join(", ")}
                            />
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
    );
}

// Helper: Info Row
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <Label className="text-muted-foreground">{label}</Label>
            <p className="font-medium">{value}</p>
        </div>
    );
}
