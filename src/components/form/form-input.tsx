// @/components/form/form-input.tsx
"use client"; // Required for useState

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Assuming you have this, otherwise use a raw <button>
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/lib/utils";

/**
 * Props for FormInput component.
 */
interface FormInputProps
    extends Omit<
        React.ComponentProps<"input">,
        "value" | "onChange" | "onBlur"
    > {
    /** The TanStack Form field API object */
    field: AnyFieldApi;

    /** The label text displayed above the input */
    label: string;

    /** Custom ID. Defaults to field name. */
    id?: string;

    /** Adds asterisk and required attribute. */
    required?: boolean;

    /** Manual error override. */
    error?: string;

    /** CSS for the outer Field wrapper. */
    className?: string;
}

/**
 * A comprehensive Input wrapper for TanStack Form.
 * Automatically handles text, numbers, and **password toggling**.
 *
 * @example
 * <FormInput
 *   field={field}
 *   label="Password"
 *   type="password" // Automatically adds show/hide button
 *   required
 * />
 */
export function FormInput({
    field,
    label,
    id,
    required,
    error,
    className,
    type = "text", // Default to text
    ...props
}: FormInputProps) {
    const { name, state, handleChange, handleBlur } = field;
    const { value, meta } = state;
    const inputId = id || name;

    // Password Toggle Logic
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";

    // If it's a password field and we are "showing" it, switch type to text
    const currentType = isPasswordType && showPassword ? "text" : type;

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

            <div className="relative">
                <Input
                    {...props}
                    id={inputId}
                    type={currentType}
                    value={value as string}
                    onBlur={handleBlur}
                    onChange={(e) => handleChange(e.target.value)}
                    required={required}
                    // Add padding to right if password icon is present to prevent text overlap
                    className={cn(isPasswordType && "pr-10")}
                />

                {isPasswordType && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={props.disabled}
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1} // Skip tabbing to this button for smoother form navigation
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                )}
            </div>

            {activeErrors && (
                <FieldError className="pl-2" errors={activeErrors} />
            )}
        </Field>
    );
}
