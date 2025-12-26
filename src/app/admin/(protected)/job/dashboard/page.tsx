import { JobDashboard } from "@admin/job/dashboard";
import { PageLayout } from "@admin/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, List } from "lucide-react";

export default function JobDashboardPage() {
    return (
        <PageLayout
            title="Job Dashboard"
            description="Monitor job statistics and running jobs"
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/job">
                            <List className="mr-2 h-4 w-4" />
                            View All Jobs
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
            <JobDashboard />
        </PageLayout>
    );
}