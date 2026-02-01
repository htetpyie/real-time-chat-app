'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/token';
import apiClient from '@/lib/api-client';
import { Message, User, ApiResponse } from '@/types/api';

interface ChatHistoryRequest {
    UserId: string;
    PageNo: number;
    PageSize: number;
}

export function useSignalR() {
    const router = useRouter();
    const connection = useRef<HubConnection | null>(null);
    const isMounted = useRef(true);
    const isLoadingUsers = useRef(false);

    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentRecipientId, setCurrentRecipientId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load users
    const loadUsers = useCallback(async () => {
        if (isLoadingUsers.current) return;

        isLoadingUsers.current = true;
        setLoadingUsers(true);

        try {
            const response = await apiClient.get<ApiResponse<User[]>>('/chat/users');
            if (isMounted.current) {
                setUsers(response.data || []);
            }
        } catch (err: any) {
            console.error('Failed to load users:', err);
            if (err.message?.includes('401')) {
                tokenManager.removeToken();
                router.push('/login');
            }
        } finally {
            isLoadingUsers.current = false;
            if (isMounted.current) {
                setLoadingUsers(false);
            }
        }
    }, [router]);

    // NEW: Reset unread count for a user
    const resetUnreadCount = useCallback((userId: string) => {
        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.userId === userId ? { ...u, unreadCount: 0 } : u
            )
        );
    }, []);

    // NEW: Mark messages as read (call API)
    const markAsRead = useCallback(async (senderId: string) => {
        try {
            await apiClient.post('/chat/mark-as-read', { senderId });
            resetUnreadCount(senderId);
        } catch (err: any) {
            console.error('Failed to mark as read:', err);
        }
    }, [resetUnreadCount]);

    const updateUserListWithMessage = useCallback((message: Message) => {
        if (!isMounted.current) return;

        setUsers(prevUsers => {
            const currentUser = tokenManager.getUser();
            if (!currentUser) return prevUsers;

            const isMeSender = message.senderId === currentUser.userId;
            const partnerId = isMeSender ? message.recipientId : message.senderId;

            if (partnerId === currentUser.userId) return prevUsers;

            const partnerName = isMeSender
                ? 'User'
                : (message.senderName || 'User');

            const partnerIndex = prevUsers.findIndex(u => u.userId === partnerId);

            if (partnerIndex >= 0) {
                // Move to top
                const updatedUsers = [...prevUsers];
                const [existingUser] = updatedUsers.splice(partnerIndex, 1);

                // Only increment unread if I'm NOT the sender AND I'm NOT currently viewing this chat
                const isCurrentChat = currentRecipientId === partnerId;
                const newUnreadCount = (!isMeSender && !isCurrentChat)
                    ? (existingUser.unreadCount || 0) + 1
                    : existingUser.unreadCount;

                return [{
                    ...existingUser,
                    lastMessage: message.message,
                    lastMessageTime: message.sentDateString || new Date().toISOString(),
                    lastSeen: message.sentTimeAgo || new Date().toISOString(),
                    unreadCount: newUnreadCount,
                }, ...updatedUsers];
            } else if (currentUser.isAdmin) {
                // Add new user
                const newUser: User = {
                    userId: partnerId,
                    userName: partnerName,
                    isOnline: false,
                    isAdmin: false,
                    lastMessage: message.message,
                    lastMessageTime: message.sentDateString || new Date().toISOString(),
                    unreadCount: 0
                };
                return [newUser, ...prevUsers];
            }

            return prevUsers;
        });
    }, [currentRecipientId]);

    const loadHistory = useCallback(async (userId: string, pageNo: number = 1) => {
        if (!userId) return;

        setLoadingMessages(true);
        setCurrentRecipientId(userId);

        // Reset unread count locally when opening chat
        resetUnreadCount(userId);

        setCurrentPage(pageNo);

        try {
            const requestBody: ChatHistoryRequest = {
                UserId: userId,
                PageNo: pageNo,
                PageSize: 20
            };

            const response = await apiClient.post<ApiResponse<Message[]>>(
                '/chat/history',
                requestBody
            );

            const history = response.data || [];

            if (isMounted.current) {
                if (pageNo === 1) {
                    setMessages(history);
                } else {
                    setMessages(prev => [...history, ...prev]);
                }
                setHasMoreMessages(history.length === 20);
            }

            // Mark messages as read on server
            await markAsRead(userId);

        } catch (err: any) {
            console.error('Failed to load history:', err);
            if (err.message?.includes('401')) {
                tokenManager.removeToken();
                router.push('/login');
            }
        } finally {
            if (isMounted.current) {
                setLoadingMessages(false);
            }
        }
    }, [router, markAsRead, resetUnreadCount]);

    const loadMoreMessages = useCallback(async () => {
        if (!currentRecipientId || !hasMoreMessages || loadingMessages) return;
        const nextPage = currentPage + 1;
        await loadHistory(currentRecipientId, nextPage);
        setCurrentPage(nextPage);
    }, [currentRecipientId, currentPage, hasMoreMessages, loadingMessages, loadHistory]);

    useEffect(() => {
        isMounted.current = true;

        const token = tokenManager.getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        const hubUrl = process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/chatHub`
            : 'http://localhost:5001/chatHub';

        const conn = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => tokenManager.getToken() || '',
                transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.retryReason?.message?.includes('401')
                        || retryContext.retryReason?.message?.includes('Unauthorized')) {
                        tokenManager.removeToken();
                        router.push('/login');
                        return null;
                    }
                    return Math.min(1000 * 2 ** retryContext.previousRetryCount, 10000);
                }
            })
            .configureLogging(LogLevel.Warning)
            .build();

        conn.on('ReceiveMessage', (message: Message) => {
            if (!isMounted.current) return;

            setMessages((prev) => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });

            updateUserListWithMessage(message);
        });

        conn.on('UserConnected', (userId: string) => {
            if (!isMounted.current || !userId) return;
            setUsers(prev => prev.map(u =>
                u.userId === userId ? { ...u, isOnline: true } : u
            ));
        });

        conn.on('UserDisconnected', (userId: string) => {
            if (!isMounted.current || !userId) return;
            setUsers(prev => prev.map(u =>
                u.userId === userId ? { ...u, isOnline: false } : u
            ));
        });

        conn.onclose((error) => {
            if (!isMounted.current) return;
            setIsConnected(false);
            if (error?.message?.includes('401')) {
                tokenManager.removeToken();
                router.push('/login');
            }
        });

        const startConnection = async () => {
            try {
                await conn.start();
                if (!isMounted.current) {
                    conn.stop();
                    return;
                }
                setIsConnected(true);
                await loadUsers();
            } catch (err: any) {
                if (err.message?.includes('stopped during negotiation')) return;
                if (!isMounted.current) return;
                if (err.message?.includes('401')) {
                    tokenManager.removeToken();
                    router.push('/login');
                }
            }
        };

        startConnection();
        connection.current = conn;

        return () => {
            isMounted.current = false;
            conn.stop();
        };
    }, [router, loadUsers, updateUserListWithMessage]);

    const sendMessage = useCallback(async (recipientId: string, message: string) => {
        if (connection.current?.state !== 'Connected') {
            throw new Error('Not connected');
        }
        try {
            await connection.current.invoke('SendMessage', {
                recipientId,
                message
            });
        } catch (err: any) {
            if (err.message?.includes('401')) {
                tokenManager.removeToken();
                router.push('/login');
            }
            throw err;
        }
    }, [router]);

    const disconnect = useCallback(() => {
        if (connection.current) {
            connection.current.stop();
        }
        setIsConnected(false);
    }, []);

    return {
        isConnected,
        messages,
        users,
        loadingMessages,
        loadingUsers,
        hasMoreMessages,
        error,
        sendMessage,
        loadHistory,
        loadMoreMessages,
        refreshUsers: loadUsers,
        resetUnreadCount,
        markAsRead,
        disconnect,
    };
}