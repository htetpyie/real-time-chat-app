'use client';

import { useEffect, useRef, useState } from 'react';
import { useSignalR } from '@/hooks/use-signalr';
import { useAuthStore } from '@/stores/auth-store';
import { User } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Headphones, Loader2, ChevronUp } from 'lucide-react';
import { MessageBubble } from './message-bubble';

interface ChatWindowProps {
    recipient: User | null;
    isAdmin: boolean;
}

export function ChatWindow({ recipient, isAdmin }: ChatWindowProps) {
    const user = useAuthStore((state) => state.user);
    const {
        messages,
        sendMessage,
        isConnected,
        loadingMessages,
        hasMoreMessages,
        loadHistory,
        loadMoreMessages
    } = useSignalR();
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    useEffect(() => {
        if (recipient?.userId) {
            loadHistory(recipient.userId, 1);
            setShouldScrollToBottom(true);
        } else if (!isAdmin) {
            loadHistory('admin', 1);
            setShouldScrollToBottom(true);
        }
    }, [recipient?.userId, isAdmin, loadHistory]); 

    // Auto-scroll to bottom
    useEffect(() => {
        if (shouldScrollToBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, shouldScrollToBottom]);

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
            setShouldScrollToBottom(isAtBottom);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const targetId = isAdmin ? recipient?.userId : 'admin';
        if (!targetId) return;

        try {
            await sendMessage(targetId, inputMessage);
            setInputMessage('');
            setShouldScrollToBottom(true);
        } catch (error) {
            console.error('Failed to send:', error);
        }
    };

    const conversationMessages = messages.filter(msg => {
        if (isAdmin && recipient) {
            return msg.senderId === recipient.userId || msg.recipientId === recipient.userId;
        }
        return true;
    });

    if (isAdmin && !recipient) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-900">
                <div className="text-center text-slate-400">
                    <Headphones className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a user to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-slate-900 h-full">
            {/* Header */}
            <div className="h-16 border-b border-slate-700 flex items-center px-6 bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-medium">
                        {isAdmin ? recipient?.userName?.[0].toUpperCase() : 'S'}
                    </div>
                    <div>
                        <h3 className="font-medium text-white">
                            {isAdmin ? recipient?.userName : 'Support Team'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-slate-400">
                                {isConnected ? 'Online' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 space-y-4"
            >
                {/* Load more button */}
                {hasMoreMessages && conversationMessages.length > 0 && (
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={loadMoreMessages}
                            disabled={loadingMessages}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {loadingMessages ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ChevronUp className="w-4 h-4" />
                            )}
                            Load older messages
                        </button>
                    </div>
                )}

                {loadingMessages && conversationMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading messages...
                    </div>
                ) : conversationMessages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    conversationMessages.map((msg, index) => (
                        <MessageBubble key={msg.id || index} message={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="h-20 border-t border-slate-700 bg-slate-800/50 p-4">
                <form onSubmit={handleSend} className="flex gap-3 h-full">
                    <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={!isConnected}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={!isConnected || !inputMessage.trim()}
                        className="px-6"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}