'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { tokenManager } from '@/lib/token';
import { useAuthStore } from '@/stores/auth-store';
import { ApiResponse, LoginRequest, RegisterRequest,RegisterResponse, AuthResponse, User } from '@/types/api';

export function useAuth() {
    const router = useRouter();
    const { user, setUser, setLoading } = useAuthStore();

    useEffect(() => {
        const initAuth = () => {
            const token = tokenManager.getToken();
            const savedUser = tokenManager.getUser();

            if (token && savedUser) {
                setUser(savedUser);
            }
            setLoading(false);
        };

        initAuth();
    }, [setUser, setLoading]);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
            const { token, user } = response.data;
            tokenManager.setToken(token);
            tokenManager.setUser(user);
            setUser(user);
            router.push('/chat');
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
            //router.push('/login');
            return { success: true, message: "Registration is success! Go back to Sign in."};
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        tokenManager.removeToken();
        setUser(null);
        router.push('/login');
    };

    return {
        user,
        isLoading: useAuthStore((state) => state.isLoading),
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin,
        login,
        register,
        logout,
    };
}