// @/components/form/form-textarea.tsx
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { AnyFieldApi } from "@tanstack/react-form";

/**
 * Props for FormTextarea component.
 * Extends standard HTML textarea attributes.
 */
interface FormTextareaProps
    extends Omit<
        React.ComponentProps<"textarea">,
        "value" | "onChange" | "onBlur"
    > {
    /** The TanStack Form field API object */
    field: AnyFieldApi;

    /** The label text displayed above the textarea */
    label: string;

    /** Displays a red asterisk next to the label */
    required?: boolean;

    /** Manually override the error message */
    error?: string;

    /** Custom CSS classes for the outer Field wrapper */
    className?: string;

    /** Custom ID (defaults to field name) */
    id?: string;
}

/**
 * A textarea form field component integrated with TanStack Form.
 * Supports standard HTML textarea props.
 *
 * @example
 * <FormTextarea
 *   field={field}
 *   label="Description"
 *   placeholder="Enter details..."
 *   rows={5}
 *   required
 * />
 */
export function FormTextarea({
    field,
    label,
    id,
    required,
    error,
    className,
    ...props
}: FormTextareaProps) {
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

            <Textarea
                {...props}
                id={inputId}
                value={value as string}
                onBlur={handleBlur}
                onChange={(e) => handleChange(e.target.value)}
                required={required}
            />

            {activeError && (
                <FieldError className="pl-2" errors={activeError} />
            )}
        </Field>
    );
}
