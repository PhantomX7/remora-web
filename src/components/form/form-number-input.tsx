// @/components/form/form-number-input.tsx
"use client";

import { NumberInput } from "@/components/common/number-input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { AnyFieldApi } from "@tanstack/react-form";

/**
 * Props for FormNumberInput component.
 * 
 * Extends standard HTML input attributes while excluding conflicting props.
 */
interface FormNumberInputProps
    extends Omit<
        React.ComponentProps<"input">,
        "value" | "onChange" | "onBlur" | "min" | "max" | "type"
    > {
    /** The TanStack Form field API object */
    field: AnyFieldApi;

    /** The label text displayed above the input */
    label: string;

    /**
     * Custom ID for the input.
     * Defaults to the field name if not provided.
     */
    id?: string;

    /** Minimum allowed value */
    min?: number;

    /** Maximum allowed value */
    max?: number;

    /**
     * Displays a red asterisk next to the label.
     */
    required?: boolean;

    /**
     * Manually override the error message.
     * Useful for server-side errors not caught by form validation.
     */
    error?: string;

    /** Custom CSS classes for the outer Field wrapper */
    className?: string;
}

/**
 * A number input form field component integrated with TanStack Form.
 * 
 * Wraps the NumberInput component with standard Label and Error handling.
 * Automatically formats numbers with thousand separators (1.000.000).
 *
 * @example
 * ```tsx
 * <FormNumberInput
 *   field={field}
 *   label="Price (IDR)"
 *   placeholder="Enter price..."
 *   min={0}
 *   max={1000000}
 *   required
 * />
 * ```
 */
export function FormNumberInput({
    field,
    label,
    id,
    required,
    error,
    className,
    min,
    max,
    placeholder,
    disabled,
}: FormNumberInputProps) {
    const { name, state, handleChange, handleBlur } = field;
    const { value, meta } = state;
    const inputId = id || name;

    // Determine active errors (Custom error prop > Validation errors)
    const activeErrors = error
        ? [{ message: error }]
        : meta.isTouched && meta.errors.length
        ? meta.errors
        : undefined;

    return (
        <Field className={className}>
            <FieldLabel htmlFor={inputId}>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>

            <NumberInput
                value={value as string | number}
                onValueChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
            />

            {activeErrors && (
                <FieldError className="pl-2" errors={activeErrors} />
            )}
        </Field>
    );
}