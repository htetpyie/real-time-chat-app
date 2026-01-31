'use client';

import { User } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Search, Circle } from 'lucide-react';
import { useState } from 'react';
import { useUsers } from '@/hooks/use-users';

interface UserListProps {
    selectedUser: User | null;
    onSelectUser: (user: User) => void;
}

export function UserList({ selectedUser, onSelectUser }: UserListProps) {
    const { users, loading } = useUsers();
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(u =>
        u.userName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
            <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-3">Users</h2>
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
                {loading ? (
                    <div className="p-4 text-center text-slate-400">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No users found</div>
                ) : (
                    filteredUsers.map((user) => (
                        <button
                            key={user.userId}
                            onClick={() => onSelectUser(user)}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-slate-700/50 transition-colors border-l-4 ${selectedUser?.userId === user.userId
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
                            <div className="flex-1 text-left">
                                <div className="font-medium text-slate-200">{user.userName}</div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}