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
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentRecipientId, setCurrentRecipientId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const response = await apiClient.get<ApiResponse<User[]>>('/chat/users');
            setUsers(response.data || []);
        } catch (err: any) {
            console.error('Failed to load users:', err);
            if (err.message?.includes('401')) {
                tokenManager.removeToken();
                router.push('/login');
            }
        } finally {
            setLoadingUsers(false);
        }
    }, [router]);

    const loadHistory = useCallback(async (userId: string, pageNo: number = 1) => {
        if (!userId) return;

        setLoadingMessages(true);
        setCurrentRecipientId(userId);
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

            if (pageNo === 1) {
                setMessages(history);
            } else {
                setMessages(prev => [...history, ...prev]);
            }
            setHasMoreMessages(history.length === 20);

        } catch (err: any) {
            console.error('Failed to load history:', err);
            if (err.message?.includes('401')) {
                tokenManager.removeToken();
                router.push('/login');
            }
        } finally {
            setLoadingMessages(false);
        }
    }, [router]);

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
            .configureLogging(LogLevel.Warning) // Reduced logging
            .build();

        conn.on('ReceiveMessage', (message: Message) => {
            if (!isMounted.current) return;

            setMessages((prev) => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });

            setUsers(prev => prev.map(u => {
                if (u.userId === message.senderId || u.userId === message.recipientId) {
                    return {
                        ...u,
                        lastMessage: message.message,
                        lastMessageTime: message.sentDateString,
                        unreadCount: message.recipientId === u.userId ? (u.unreadCount || 0) + 1 : u.unreadCount
                    };
                }
                return u;
            }));
        });

        conn.on('UserConnected', (userId: string) => {
            if (!isMounted.current) return;
            setUsers(prev => prev.map(u =>
                u.userId === userId ? { ...u, isOnline: true } : u
            ));
        });

        conn.on('UserDisconnected', (userId: string) => {
            if (!isMounted.current) return;
            setUsers(prev => prev.map(u =>
                u.userId === userId ? { ...u, isOnline: false } : u
            ));
        });

        conn.onclose((error) => {
            if (!isMounted.current) return;

            setIsConnected(false);
            if (error?.message?.includes('401') ||
                error?.message?.includes('Unauthorized')) {
                tokenManager.removeToken();
                router.push('/login');
            }
        });

        // Start connection with error suppression for Strict Mode
        const startConnection = async () => {
            try {
                await conn.start();

                if (!isMounted.current) {
                    conn.stop(); // Clean up if unmounted during connection
                    return;
                }

                setIsConnected(true);
                loadUsers();
            } catch (err: any) {
                // Suppress Strict Mode cancellation error
                if (err.message?.includes('stopped during negotiation') ||
                    err.message?.includes('The connection was closed')) {
                    // This is just React Strict Mode remounting, ignore it
                    console.log('SignalR: Connection cancelled (Strict Mode)');
                    return;
                }

                if (!isMounted.current) return;

                console.error('SignalR Error:', err.message);
                if (err.message?.includes('401')) {
                    tokenManager.removeToken();
                    router.push('/login');
                } else {
                    setError(err.message);
                }
            }
        };

        startConnection();
        connection.current = conn;

        return () => {
            isMounted.current = false;
            conn.stop();
        };
    }, [router, loadUsers]);

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
    };
}