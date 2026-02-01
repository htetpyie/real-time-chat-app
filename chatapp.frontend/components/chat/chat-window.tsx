'use client';

import { useEffect, useRef, useState } from 'react';
import { useSignalR } from '@/hooks/use-signalr';
import { useAuthStore } from '@/stores/auth-store';
import { User } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Headphones, Loader2, ChevronUp, ArrowLeft } from 'lucide-react';
import { MessageBubble } from './message-bubble';

interface ChatWindowProps {
    recipient: User | null;
    isAdmin: boolean;
    onBack?: () => void; // For mobile back button
}

export function ChatWindow({ recipient, isAdmin, onBack }: ChatWindowProps) {
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
            {/* Header - Fixed Layout */}
            <div className="h-16 border-b border-slate-700 flex items-center px-3 bg-slate-800/50">
                <div className="flex items-center gap-2 w-full min-w-0">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="md:hidden text-slate-400 hover:text-white h-9 w-9 flex-shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}

                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-medium flex-shrink-0 text-sm">
                        {isAdmin ? recipient?.userName?.[0].toUpperCase() : 'S'}
                    </div>

                    <div className="min-w-0 flex-1 overflow-hidden">
                        <h3 className="font-medium text-white text-sm truncate leading-tight">
                            {isAdmin ? recipient?.userName : 'Support Team'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-slate-400">
                                {isConnected ? 'Online' : 'Offline'}
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

            {/* Input */}
            <div className="h-auto min-h-[80px] border-t border-slate-700 bg-slate-800/50 p-4">
                <form onSubmit={handleSend} className="flex flex-col gap-2">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value.slice(0, 450))} // Hard limit
                                placeholder="Type a message..."
                                disabled={!isConnected}
                                className="w-full pr-16"
                                maxLength={450}
                            />
                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${inputMessage.length >= 400 ? 'text-amber-400' : 'text-slate-500'
                                }`}>
                                {inputMessage.length}/450
                            </span>
                        </div>
                        <Button
                            type="submit"
                            disabled={!isConnected || !inputMessage.trim() || inputMessage.length > 450}
                            className="px-6"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>

                    {inputMessage.length >= 400 && (
                        <p className="text-xs text-amber-400 text-right">
                            {450 - inputMessage.length} characters remaining
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}