import axiosClient from "./axiosClient";
import type { Message } from "../types/Message";

// Backend response wrapper
interface ApiResponse<T> {
    responseCode: number;
    message: string;
    data: T;
    isSuccess: boolean;
}

// Get paginated chat history
export const getHistory = async (userId: string, page = 1, pageSize = 20) => {
    const res = await axiosClient.get<ApiResponse<Message[]>>(
        `/chat/history/${userId}?page=${page}&pageSize=${pageSize}`
    );

    if (!res.data.isSuccess) {
        throw new Error(res.data.message || "Failed to load chat history");
    }

    return res.data.data; // return only the message array
};
