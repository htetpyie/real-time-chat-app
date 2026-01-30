import axiosClient from "./axiosClient";
import type { Message } from "../types/Message";
import type { User } from "../types/User";
import type { ApiResponse } from "../types/ApiResponse";

// Load paginated messages between current user and selected user
export const getHistory = async (
    userId: string,
    pageNo: number = 1,
    pageSize: number = 20
) => {
    const res = await axiosClient.post<ApiResponse<Message[]>>("/chat/history", {
        userId,
        pageNo,
        pageSize,
    });

    if (!res.data.isSuccess) {
        throw new Error(res.data.message || "Failed to load chat history");
    }

    return res.data.data;
};

// Load user list (admin only)
export const getUserList = async () => {
    const res = await axiosClient.get<ApiResponse<User[]>>(`/chat/users`);
    if (!res.data.isSuccess) throw new Error(res.data.message || "Failed to load user list");
    return res.data.data;
};
