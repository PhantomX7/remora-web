"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropsWithChildren, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface PageLayoutProps extends PropsWithChildren {
    title?: string;
    description?: string;
    backLink?: string | "back";
    backLabel?: string;
    actions?: ReactNode;
}

export function PageLayout({
    title,
    description,
    backLink,
    backLabel = "Back",
    actions,
    children,
}: PageLayoutProps) {
    const router = useRouter();
    const showHeader = backLink || actions;
    const showCardHeader = title || description;

    return (
        <div className="container mx-auto py-6 space-y-4">
            {/* Top Navigation Bar */}
            {showHeader && (
                <div className="flex items-center justify-between gap-4">
                    {/* Back Navigation */}
                    {backLink &&
                        (backLink === "back" ? (
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {backLabel}
                            </Button>
                        ) : (
                            <Button variant="outline" asChild className="gap-2">
                                <Link href={backLink}>
                                    <ArrowLeft className="h-4 w-4" />
                                    {backLabel}
                                </Link>
                            </Button>
                        ))}

                    {/* Page Actions (ml-auto pushes this to the right even if backLink is missing) */}
                    {actions && (
                        <div className="flex items-center gap-2 ml-auto">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            {/* Main Content */}
            <Card>
                {showCardHeader && (
                    <CardHeader>
                        <div className="space-y-1">
                            {title && <CardTitle>{title}</CardTitle>}
                            {description && (
                                <CardDescription>{description}</CardDescription>
                            )}
                        </div>
                    </CardHeader>
                )}
                <CardContent>{children}</CardContent>
            </Card>
        </div>
    );
}
