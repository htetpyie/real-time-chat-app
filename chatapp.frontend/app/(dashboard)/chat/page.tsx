'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSignalR } from '@/hooks/use-signalr';
import { UserList } from '@/components/chat/user-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { User } from '@/types/api';

export default function ChatPage() {
    const { user } = useAuth();
    const { isConnected } = useSignalR();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    if (!user) return null;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-900">
            {user.isAdmin ? (
                <>
                    <UserList
                        selectedUser={selectedUser}
                        onSelectUser={setSelectedUser}
                    />
                    <ChatWindow
                        recipient={selectedUser}
                        isAdmin={true}
                    />
                </>
            ) : (
                <ChatWindow
                    recipient={null}
                    isAdmin={false}
                />
            )}
        </div>
    );
}