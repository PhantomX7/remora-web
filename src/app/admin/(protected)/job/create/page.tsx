import { JobForm } from "@admin/job/form";
import { PageLayout } from "@admin/page-layout";

export default function CreateJobPage() {
    return (
        <PageLayout
            title="Create Job"
            backLink="/admin/job"
            backLabel="Back to Jobs"
        >
            <JobForm />
        </PageLayout>
    );
}