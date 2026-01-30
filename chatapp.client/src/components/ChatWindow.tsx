import React, { useEffect, useState, useRef, useContext } from "react";
import { Box, TextField, Button, Paper, Typography, Stack } from "@mui/material";
import type { Message } from "../types/Message";
import { AuthContext } from "../context/AuthContext";
import { startConnection, sendMessage} from "../services/signalrService";
import { getHistory } from "../api/chatApi";
import { ConnectionStatus } from "./ConnectionStatus";

interface ChatWindowProps {
    selectedUserId: string | null;
    isAdmin: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUserId, isAdmin }) => {
    const { user, logout } = useContext(AuthContext)!;
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState("Connecting");
    const [message, setMessage] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;
        startConnection(user.token, (msg: Message) => setMessages(prev => [...prev, msg]), setStatus, logout);
    }, [user]);

    useEffect(() => {
        if (!user || !selectedUserId) return;
        const loadHistory = async () => {
            try {
                const history = await getHistory(selectedUserId);
                setMessages(history);
            } catch (err) {
                console.error(err);
            }
        };
        loadHistory();
    }, [selectedUserId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async () => {
        if (!message.trim() || !selectedUserId) return;
        if (status !== "Connected") return;

        try {
            await sendMessage(selectedUserId, message,logout);
            setMessage("");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Paper sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
            <ConnectionStatus status={status} />
            <Box sx={{ flex: 1, overflowY: "auto", mb: 1 }}>
                {messages.map((m, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: m.senderId === user?.userId? "flex-end" : "flex-start", mb: 1 }}>
                        <Paper sx={{ p: 1.5, maxWidth: "70%" }}>
                            <Typography variant="body1">{m.message}</Typography>
                            <Typography variant="caption" sx={{ float: "right" }}>{m.sentDateString}</Typography>
                        </Paper>
                    </Box>
                ))}
                <div ref={bottomRef}></div>
            </Box>
            <Stack direction="row" spacing={1}>
                <TextField fullWidth value={message} onChange={e => setMessage(e.target.value)} disabled={status !== "Connected"} />
                <Button variant="contained" onClick={send} disabled={status !== "Connected" || !message.trim()}>Send</Button>
            </Stack>
        </Paper>
    );
};
