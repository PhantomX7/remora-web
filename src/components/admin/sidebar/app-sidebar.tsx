"use client";

import * as React from "react";
import { Command, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { NavMain } from "@admin/sidebar/nav-main";
import { NavUser } from "@admin/sidebar/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// Export these so Layout can use them for Type Casting
export interface NavItem {
    title: string;
    url: string;
}

export interface NavMainItem {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: NavItem[];
    requiredRoles?: string[];
}

export interface SidebarData {
    navMain: NavMainItem[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    data: SidebarData;
}

export function AppSidebar({ data, ...props }: AppSidebarProps) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        RSU Deli
                                    </span>
                                    <span className="truncate text-xs">
                                        Admin Panel 
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {data.navMain && <NavMain items={data.navMain} />}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
