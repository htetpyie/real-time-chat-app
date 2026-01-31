'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/token';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const token = tokenManager.getToken();
        if (token) {
            router.push('/chat');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {children}
        </div>
    );
}