"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Lock, Home } from "lucide-react";
import Link from "next/link";

export function ForbiddenPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Access Denied
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        You don`t have permission to access this page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-sm text-gray-500">
                        <p>Error Code: 403 - Forbidden</p>
                        <p className="mt-2">
                            If you believe this is an error, please contact your
                            administrator.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Link href="/" className="flex-1">
                            <Button className="w-full">
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
