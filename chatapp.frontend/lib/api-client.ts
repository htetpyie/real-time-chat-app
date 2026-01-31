import axios from 'axios';
import { tokenManager } from './token';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = tokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        const apiResponse: ApiResponse<any> = response.data;

        if (!apiResponse.isSuccess) {
            throw new Error(apiResponse.message);
        }

        return { ...response, data: apiResponse.data };
    },
    (error) => {
        if (error.response?.status === 401) {
            tokenManager.removeToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        const message = error.response?.data?.Message || error.message;
        return Promise.reject(new Error(message));
    }
);

export default apiClient;