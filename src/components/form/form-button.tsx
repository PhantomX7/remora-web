// @/components/form/form-button.tsx
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Props for the FormButton component.
 * Extends standard shadcn/ui ButtonProps.
 */
interface FormButtonProps extends ButtonProps {
    /**
     * If true, displays a spinner and disables the button.
     * @default false
     */
    isLoading?: boolean;

    /**
     * Text to display alongside the spinner when loading.
     * @default "Loading..."
     */
    loadingText?: string;
}

/**
 * A wrapper around the UI Button component that handles loading states automatically.
 *
 * @example
 * ```tsx
 * <FormButton isLoading={isSubmitting} onClick={handleSubmit}>
 *   Save Changes
 * </FormButton>
 * ```
 */
export function FormButton({
    isLoading = false,
    loadingText = "Loading...",
    children,
    className,
    disabled,
    ...props
}: FormButtonProps) {
    return (
        <Button
            disabled={isLoading || disabled}
            className={className}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingText}
                </>
            ) : (
                children
            )}
        </Button>
    );
}
