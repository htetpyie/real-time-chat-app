'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { ApiResponse, User } from '@/types/api';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get<ApiResponse<User[]>>('/users');
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    return { users, loading, refresh: fetchUsers };
}