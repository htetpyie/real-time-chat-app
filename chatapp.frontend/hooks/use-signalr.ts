'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { tokenManager } from '@/lib/token';
import { Message } from '@/types/api';

export function useSignalR() {
    const connection = useRef<HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const token = tokenManager.getToken();

        if (!token) return;

        const conn = new HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/chatHub`, {
                accessTokenFactory: () => token,
                transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(LogLevel.Information)
            .build();

        conn.on('ReceiveMessage', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        conn.on('UserConnected', (userId: string) => {
            console.log('User connected:', userId);
        });

        conn.on('UserDisconnected', (userId: string) => {
            console.log('User disconnected:', userId);
        });

        conn.start()
            .then(() => setIsConnected(true))
            .catch((err) => console.error('SignalR Error:', err));

        connection.current = conn;

        return () => {
            conn.stop();
        };
    }, []);

    const sendMessage = useCallback(async (recipientId: string, content: string) => {
        if (connection.current?.state !== 'Connected') {
            throw new Error('Not connected');
        }
        await connection.current.invoke('SendMessage', { recipientId, content });
    }, []);

    return {
        isConnected,
        messages,
        sendMessage,
    };
}