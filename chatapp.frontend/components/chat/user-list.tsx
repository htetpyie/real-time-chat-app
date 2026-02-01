'use client';

import { User } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Search, Circle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSignalR } from '@/hooks/use-signalr';

interface UserListProps {
    selectedUser: User | null;
    onSelectUser: (user: User) => void;
}

export function UserList({ selectedUser, onSelectUser }: UserListProps) {
    const { users, loadingUsers, refreshUsers } = useSignalR();
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(u =>
        u.userName.toLowerCase().includes(search.toLowerCase())
    );

    // Sort by most recent message first
    const sortedUsers = filteredUsers.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });

    return (
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Conversations</h2>
                    <button
                        onClick={refreshUsers}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                        Refresh
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loadingUsers ? (
                    <div className="p-4 text-center text-slate-400 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading...
                    </div>
                ) : sortedUsers.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No conversations yet</div>
                ) : (
                    sortedUsers.map((user) => (
                        <button
                            key={user.userId}  // Changed from id
                            onClick={() => onSelectUser(user)}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-slate-700/50 transition-colors border-l-4 ${selectedUser?.userId === user.userId  // Changed from id
                                    ? 'border-indigo-500 bg-slate-700/30'
                                    : 'border-transparent'
                                }`}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium">
                                    {user.userName[0].toUpperCase()}
                                </div>
                                <Circle
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${user.isOnline ? 'text-emerald-500 fill-emerald-500' : 'text-slate-500 fill-slate-500'
                                        }`}
                                />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-200 truncate">
                                        {user.userName} 
                                    </span>
                                    {user.lastMessageTime && (
                                        <span className="text-xs text-slate-500">
                                            {user.lastMessageTime}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 truncate">
                                    {user.lastMessage || 'No messages yet'}
                                </p>
                            </div>

                            {/* Unread badge */}
                            {user.unreadCount ? (
                                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                                    {user.unreadCount}
                                </span>
                            ) : null}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}