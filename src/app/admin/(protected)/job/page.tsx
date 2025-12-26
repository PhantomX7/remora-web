import { JobList } from "@admin/job/list";
import { PageLayout } from "@admin/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, LayoutDashboard } from "lucide-react";

export default async function JobListPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;

    return (
        <PageLayout
            title="Jobs"
            description="Manage background jobs and scrapers"
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/job/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/job/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Job
                        </Link>
                    </Button>
                </div>
            }
        >
            <JobList params={params} />
        </PageLayout>
    );
}