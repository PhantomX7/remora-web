// @/components/admin/sidebar/nav-main.tsx
"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
    const pathname = usePathname();

    // Check if current path matches the item or any of its subitems
    const isItemActive = (item: typeof items[0]) => {
        // Check if it's the exact page (for items without subitems like Dashboard)
        if (item.url !== "#" && pathname === item.url) {
            return true;
        }
        
        // Check if any subitem matches
        if (item.items && item.items.length > 0) {
            return item.items.some((subItem) => pathname === subItem.url);
        }
        
        return false;
    };

    // Check if subitem is active
    const isSubItemActive = (url: string) => {
        return pathname === url;
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const itemActive = isItemActive(item);
                    
                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={itemActive}
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton 
                                        asChild 
                                        tooltip={item.title}
                                        isActive={itemActive}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                {item.items && item.items.length > 0 ? (
                                    <>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                <ChevronRight />
                                                <span className="sr-only">
                                                    Toggle
                                                </span>
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuSubItem
                                                        key={subItem.title}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isSubItemActive(subItem.url)}
                                                        >
                                                            <Link href={subItem.url}>
                                                                <span>
                                                                    {subItem.title}
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </>
                                ) : null}
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}