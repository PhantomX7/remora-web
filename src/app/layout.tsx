// app/admin/layout.tsx
import ReactQueryProvider from "@/components/providers/react-query-provider";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";
import "@/app/theme.css";
import { ConnectionProvider } from "@/components/providers/connection-provider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <ReactQueryProvider>
                    <ConnectionProvider>
                        <Toaster position="top-center" />
                        {children}
                    </ConnectionProvider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
