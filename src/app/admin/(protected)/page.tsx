// app/admin/page.tsx
"use client";

import { PageLayout } from "@admin/page-layout";

export default function AdminDashboardPage() {
    // 4. If Admin or Root, show the actual dashboard
    return (
        <PageLayout
            title="Dashboard"
            description="Overview of your application statistics"
        >
            HI ADMIN
        </PageLayout>
    );
}