'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNavigation } from '@/components/layout/top-navigation';
import { tokenManager } from '@/lib/token';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const token = tokenManager.getToken();
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-900">
            <TopNavigation />
            {children}
        </div>
    );
}