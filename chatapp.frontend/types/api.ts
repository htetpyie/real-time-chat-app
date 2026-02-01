export interface ApiResponse<T> {
    responseCode: number;
    message: string;
    data: T;
    isSuccess: boolean;
}

export interface User {
    userId: string;
    userName: string;
    isOnline: boolean;
    isAdmin: boolean;
    lastSeen?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
}

export interface Message {
    id: string;
    message: string;
    senderId: string;
    recipientId: string;
    sentDateString: string;
    sentTimeAgo: string;
    isRead: boolean;
    senderName?: string;
}

export interface LoginRequest {
    userName: string;
    password: string;
}

export interface RegisterRequest {
    userName: string;
    password: string;
}

export interface RegisterResponse{
    username: string;
    message: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface SendMessageRequest {
    recipientId: string;
    message: string;
}