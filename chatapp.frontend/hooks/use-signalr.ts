'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/token';
import { Message } from '@/types/api';

export function useSignalR() {
    const router = useRouter();
    const connection = useRef<HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = tokenManager.getToken();

        if (!token) {
            console.log('No token, redirecting to login');
            router.push('/login');
            return;
        }

        const hubUrl = 'http://localhost:5001/chatHub';

        console.log('Connecting to:', hubUrl);

        const conn = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => token,
                transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // If it was a 401 error, don't retry, logout immediately
                    if (retryContext.retryReason?.message?.includes('401') ||
                        retryContext.retryReason?.message?.includes('Unauthorized')) {
                        console.error('Unauthorized, logging out');
                        tokenManager.removeToken();
                        router.push('/login');
                        return null; // Stop retrying
                    }
                    return Math.min(1000 * 2 ** retryContext.previousRetryCount, 10000);
                }
            })
            .configureLogging(LogLevel.Debug)
            .build();

        conn.on('ReceiveMessage', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        conn.onclose((error) => {
            console.log('Connection closed:', error);
            setIsConnected(false);
            if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
                console.error('Unauthorized connection closed');
                tokenManager.removeToken();
                router.push('/login');
            }
        });

        conn.start()
            .then(() => {
                console.log('SignalR Connected');
                setIsConnected(true);
                setError(null);
            })
            .catch((err) => {
                console.error('SignalR Connection Error:', err);
                if (err.message?.includes('401') ||
                    err.message?.includes('Unauthorized') ||
                    err.statusCode === 401) {
                    console.error('Authentication failed, logging out');
                    tokenManager.removeToken();
                    router.push('/login');
                } else {
                    setError(err.message);
                }
            });

        connection.current = conn;

        return () => {
            conn.stop();
        };
    }, [router]);

    const sendMessage = useCallback(async (recipientId: string, message: string) => {
        if (connection.current?.state !== 'Connected') {
            throw new Error('Not connected');
        }
        try {
            await connection.current.invoke('SendMessage', { recipientId, message });
        } catch (err: any) {
            if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
                tokenManager.removeToken();
                router.push('/login');
            }
            throw err;
        }
    }, [router]);

    return {
        isConnected,
        messages,
        error,
        sendMessage,
    };
}