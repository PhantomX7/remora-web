// app/admin/config/page.tsx
import { ConfigList } from "@admin/config/list";
import { PageLayout } from "@admin/page-layout";

export default async function ConfigListPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;

    return (
        <PageLayout
            title="Configuration"
            description="Manage your application settings"
        >
            <ConfigList params={params} />
        </PageLayout>
    );
}