"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function BreadcrumbComponent() {
    const pathname = usePathname();

    // Generate breadcrumb items from pathname
    const generateBreadcrumbs = () => {
        // Remove /admin prefix and split the path
        const pathSegments = pathname
            .replace("/admin", "")
            .split("/")
            .filter(Boolean);

        // Always start with Dashboard
        const breadcrumbs = [
            {
                label: "Dashboard",
                href: "/admin",
                isLast: pathSegments.length === 0,
            },
        ];

        // Build breadcrumb items for each path segment
        let currentPath = "/admin";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            // Format the segment name (capitalize first letter, handle special cases)
            const label = segment
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());

            // Handle special cases
            // if (segment === 'create') {
            //     label = 'Create';
            // } else if (segment === 'edit') {
            //     label = 'Edit';
            // }

            breadcrumbs.push({
                label,
                href: currentPath,
                isLast,
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((item) => (
                    <div key={item.href} className="flex items-center">
                        <BreadcrumbItem className="">
                            {item.isLast ? (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href}>{item.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!item.isLast && (
                            <BreadcrumbSeparator className="pl-3" />
                        )}
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
