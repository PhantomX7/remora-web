"use client";

import { useEffect } from "react";
import { FormInput } from "@/components/form/form-input";
import { FormNumberInput } from "@/components/form/form-number-input";
import { FormSelect } from "@/components/form/form-select";
import { FormCheckbox } from "@/components/form/form-checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PayloadField, JobType } from "@/types/job";
import { Info } from "lucide-react";

interface PayloadFieldsProps {
    jobType: JobType | undefined;
    form: any; 
    disabled?: boolean;
    fieldErrors?: Record<string, string>;
}

export function PayloadFields({
    jobType,
    form,
    disabled = false,
    fieldErrors,
}: PayloadFieldsProps) {
    const payloadFields = jobType?.payload_fields || [];

    // Set default values when job type changes
    useEffect(() => {
        if (!jobType?.payload_fields) return;

        jobType.payload_fields.forEach((field) => {
            if (field.default !== undefined) {
                const currentValue = form.getFieldValue(`payload_${field.name}`);
                if (currentValue === undefined || currentValue === "" || currentValue === null) {
                    form.setFieldValue(`payload_${field.name}`, field.default);
                }
            }
        });
    }, [jobType, form]);

    if (payloadFields.length === 0) {
        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    {jobType
                        ? "This job type has no configurable payload fields."
                        : "Select a job type to see available options."}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium">Payload Configuration</Label>
            <div className="grid gap-4 sm:grid-cols-2">
                {payloadFields.map((field) => (
                    <PayloadFieldInput
                        key={field.name}
                        field={field}
                        form={form}
                        disabled={disabled}
                        error={fieldErrors?.[field.name]}
                    />
                ))}
            </div>
        </div>
    );
}

interface PayloadFieldInputProps {
    field: PayloadField;
    form: any;
    disabled?: boolean;
    error?: string;
}

function PayloadFieldInput({
    field,
    form,
    disabled = false,
    error,
}: PayloadFieldInputProps) {
    const fieldName = `payload_${field.name}`;

    switch (field.type) {
        case "string":
            return (
                <form.Field name={fieldName}>
                    {(formField: any) => (
                        <FormInput
                            field={formField}
                            label={field.label}
                            placeholder={field.placeholder}
                            required={field.required}
                            disabled={disabled}
                            error={error}
                            description={field.description}
                        />
                    )}
                </form.Field>
            );

        case "number":
            return (
                <form.Field name={fieldName}>
                    {(formField: any) => (
                        <FormNumberInput
                            field={formField}
                            label={field.label}
                            placeholder={field.placeholder}
                            required={field.required}
                            disabled={disabled}
                            error={error}
                            description={field.description}
                            min={field.min}
                            max={field.max}
                        />
                    )}
                </form.Field>
            );

        case "boolean":
            return (
                <form.Field name={fieldName}>
                    {(formField: any) => (
                        <FormCheckbox
                            field={formField}
                            label={field.label}
                            description={field.description}
                            disabled={disabled}
                        />
                    )}
                </form.Field>
            );

        case "select":
            return (
                <form.Field name={fieldName}>
                    {(formField: any) => (
                        <FormSelect
                            field={formField}
                            label={field.label}
                            placeholder={field.placeholder || `Select ${field.label}`}
                            options={
                                field.options?.map((opt) => ({
                                    label: opt.label,
                                    value: opt.value,
                                })) || []
                            }
                            required={field.required}
                            disabled={disabled}
                            error={error}
                            description={field.description}
                        />
                    )}
                </form.Field>
            );

        default:
            return null;
    }
}