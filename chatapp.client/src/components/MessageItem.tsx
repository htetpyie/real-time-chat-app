import React from "react";
import type { Message } from "../types/Message";

export const MessageItem: React.FC<{ message: Message; currentUserId: number }> = ({ message, currentUserId }) => {
    const isMine = message.senderId === currentUserId;
    return <div style={{ textAlign: isMine ? "right" : "left" }}>{message.content}</div>;
};
