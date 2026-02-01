'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, User, MessagesSquare } from 'lucide-react';
import { useSignalR } from '../../hooks/use-signalr';

export function TopNavigation() {
    const { user, logout, isAdmin } = useAuth();
    const { disconnect } = useSignalR()
    const handleLogout = () => {
        disconnect();
        logout();
    };
    return (
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessagesSquare className="w-5 h-5 text-white" />
                </div>

                <span className="text-xl font-bold text-white">Chat App</span>
                {isAdmin && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 text-pink-300 text-xs rounded-full border border-pink-500/30">
                        <Shield className="w-3 h-3" />
                        Admin
                    </span>
                )}
                {!isAdmin && user && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30">
                        <User className="w-3 h-3" />
                        User
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium">
                        {user?.userName?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300 hidden sm:block">{user?.userName}</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                >
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
        </header>
    );
}