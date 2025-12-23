import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ConfirmButtonProps extends ButtonProps {
    /** The function to execute when the user confirms. */
    onConfirm: () => void;
    /** The title of the alert dialog. */
    title?: string;
    /** The description text or content of the alert dialog. */
    description?: string | ReactNode;
    /** The text to display on the confirm button. */
    confirmText?: string;
    /** The text to display on the cancel button. */
    cancelText?: string;
    /** The visual variant of the confirm action button. */
    confirmVariant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
    /** If true, shows a loading state on the trigger button. */
    isLoading?: boolean;
}

/**
 * A reusable button that triggers a confirmation dialog before executing an action.
 * Automatically handles the trigger button and the dialog layout.
 */
export function ConfirmButton({
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "destructive",
    isLoading = false,
    children,
    className,
    variant = "destructive", // Default trigger variant
    size = "sm", // Default trigger size
    disabled,
    ...props
}: ConfirmButtonProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    disabled={disabled || isLoading}
                    className={cn("cursor-pointer", className)}
                    {...props}
                >
                    {isLoading ? "Loading..." : children}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            // Prevent bubbling if this component is used inside other clickable elements
                            e.stopPropagation();
                            onConfirm();
                        }}
                        className={cn(
                            buttonVariants({ variant: confirmVariant })
                        )}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
