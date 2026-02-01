'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserList } from '@/components/chat/user-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { User } from '@/types/api';
import { ArrowLeft, Menu } from 'lucide-react';

export default function ChatPage() {
    const { user, isAdmin } = useAuth();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserList, setShowUserList] = useState(true);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setShowUserList(false); 
    };

    const handleBackToList = () => {
        setSelectedUser(null);
        setShowUserList(true);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setShowUserList(true); 
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!user) return null;

    if (isAdmin) {
        return (
            <div className="h-[calc(100vh-64px)] flex bg-slate-900">
                <div className={`
                  ${showUserList ? 'flex' : 'hidden'} 
                  md:flex 
                  w-full md:w-80 
                  flex-col 
                  h-full
                `}>
                    <UserList
                        selectedUser={selectedUser}
                        onSelectUser={handleSelectUser}
                    />
                </div>

                <div className={`
                  ${!showUserList ? 'flex' : 'hidden'} 
                  md:flex 
                  flex-1 
                  flex-col 
                  h-full
                  relative
                `}>
                    <ChatWindow
                        recipient={selectedUser}
                        isAdmin={true}
                        onBack={handleBackToList}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex bg-slate-900">
            <ChatWindow
                recipient={null}
                isAdmin={false}
            />
        </div>
    );
}