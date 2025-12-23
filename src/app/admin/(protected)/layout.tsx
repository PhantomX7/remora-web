// app/admin/layout.tsx
"use client";

import { useMemo } from "react";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";
import Breadcrumb from "@admin/breadcrumb";
import { AppSidebar, type NavMainItem } from "@admin/sidebar/app-sidebar";
import { sidebarConfig } from "@/config/sidebar";
import { useAdminAuth } from "@/hooks/admin/use-auth";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAdminAuth();

    // Filter sidebar based on user role
    const filteredSidebarConfig = useMemo(() => {
        const navMain = (sidebarConfig.navMain || []).filter((item) => {
            if (!item.requiredRoles?.length) return true;
            return user?.role && item.requiredRoles.includes(user.role);
        });
        return { navMain: navMain as NavMainItem[] };
    }, [user]);

    return (
        <AuthGuard requiredRoles={["admin", "root"]}>
            <TooltipProvider>
                <SidebarProvider>
                    <AppSidebar data={filteredSidebarConfig} />
                    <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
                            <SidebarTrigger className="-ml-1 mr-4" />
                            <Breadcrumb />
                        </header>
                        <main className="flex flex-1 flex-col gap-4 p-4">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </TooltipProvider>
        </AuthGuard>
    );
}
