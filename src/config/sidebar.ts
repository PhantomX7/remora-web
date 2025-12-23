import {
    LayoutDashboard,
    User,
    Cog,
} from "lucide-react";

// Helper constants to ensure consistency
const ROLES = {
    ROOT: "root",
    ADMIN: "admin",
    WRITER: "writer",
};

const ROLE_GROUPS = {
    ALL: [ROLES.ROOT, ROLES.ADMIN, ROLES.WRITER],
    ADMIN_ROOT: [ROLES.ROOT, ROLES.ADMIN],
    ROOT_ONLY: [ROLES.ROOT],
};

const createNavItem = (
    title: string,
    icon: unknown,
    items: { title: string; url: string }[],
    url: string = "#",
    requiredRoles: string[] = []
) => ({
    title,
    url,
    icon,
    items,
    requiredRoles,
});

export const sidebarConfig = {
    navMain: [
        // CHANGE: Dashboard is now only for Admin & Root
        createNavItem(
            "Dashboard",
            LayoutDashboard,
            [],
            "/admin",
            ROLE_GROUPS.ADMIN_ROOT
        ),

        // Admin & Root Only
        createNavItem(
            "User",
            User,
            [{ title: "List", url: "/admin/user" }],
            "#",
            ROLE_GROUPS.ROOT_ONLY
        ),

        createNavItem(
            "Config",
            Cog,
            [{ title: "List", url: "/admin/config" }],
            "#",
            ROLE_GROUPS.ADMIN_ROOT
        ),
    ],
};
