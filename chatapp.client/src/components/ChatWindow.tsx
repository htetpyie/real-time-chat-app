import React, { useEffect, useState, useRef, useContext } from "react";
import { startConnection, sendToAdmin, sendToUser } from "../services/signalrService";
import { ConnectionStatus } from "./ConnectionStatus";
import { MessageItem } from "./MessageItem";
import { AuthContext } from "../context/AuthContext";
import { getHistory } from "../api/chatApi";
import type { Message } from "../types/Message";

interface ChatWindowProps {
    isAdmin: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ isAdmin }) => {
    const { user } = useContext(AuthContext)!;
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState("Connecting");
    const [message, setMessage] = useState("");
    const [page, setPage] = useState(1);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Load chat history
    const loadHistory = async () => {
        if (!user) return;
        try {
            const history = await getHistory(user.userId, page);
            setMessages(prev => [...history, ...prev]); // prepend older messages
        } catch (err: any) {
            console.error("Failed to load history:", err.message);
        }
    };

    // Start SignalR
    useEffect(() => {
        if (!user) return;

        startConnection(user.token, (msg: Message) => {
            setMessages(prev => [...prev, msg]); // append new message
        }, setStatus);

        loadHistory();
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send message
    const send = async () => {
        if (!message.trim() || status !== "Connected") return;

        try {
            if (isAdmin) {
                await sendToUser("1", message); // TODO: replace "1" with selected userId
            } else {
                await sendToAdmin(message);
            }
            setMessage("");
        } catch (err) {
            console.error("Send message error:", err);
        }
    };

    return (
        <div>
            <ConnectionStatus status={status} />
            <div style={{ height: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "5px" }}>
                {messages.map((m, i) => (
                    <MessageItem key={i} message={m} currentUserId={user.userId} />
                ))}
                <div ref={bottomRef} />
            </div>
            <input
                placeholder="Type your message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={status !== "Connected"}
            />
            <button onClick={send} disabled={status !== "Connected" || !message.trim()}>Send</button>
        </div>
    );
};
