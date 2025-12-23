// @/components/form/form-select.tsx
import { AnyFieldApi } from "@tanstack/react-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

/**
 * Structure for a select option.
 */
interface Option {
    label: string;
    value: string;
}

/**
 * Props for FormSelect component.
 */
interface FormSelectProps {
    /** The TanStack Form field API object */
    field: AnyFieldApi;

    /** The label text displayed above the select */
    label: string;

    /** Array of options to display in the dropdown */
    options: Option[];

    /** Placeholder text displayed when no value is selected */
    placeholder?: string;

    /** Displays a red asterisk next to the label */
    required?: boolean;

    /** Disables interaction */
    disabled?: boolean;

    /** Manually override the error message */
    error?: string;

    /** Custom CSS classes for the container */
    className?: string;

    /** Custom ID (defaults to field name) */
    id?: string;
}

/**
 * A select form field component utilizing Shadcn UI Select.
 * Integrated with TanStack Form for state management and validation.
 *
 * @example
 * <FormSelect
 *   field={field}
 *   label="Status"
 *   options={[
 *     { label: "Active", value: "active" },
 *     { label: "Inactive", value: "inactive" }
 *   ]}
 * />
 */
export function FormSelect({
    field,
    label,
    options,
    placeholder = "Select an option",
    required,
    disabled,
    error,
    className,
    id,
}: FormSelectProps) {
    const { name, state, handleChange, handleBlur } = field;
    const { value, meta } = state;
    const inputId = id || name;

    const activeError = error
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

            <Select
                value={value as string}
                onValueChange={handleChange}
                disabled={disabled}
                // Simulate onBlur when dropdown closes to mark field as touched
                onOpenChange={(isOpen) => !isOpen && handleBlur()}
            >
                <SelectTrigger id={inputId}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {activeError && (
                <FieldError className="pl-2" errors={activeError} />
            )}
        </Field>
    );
}
