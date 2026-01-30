import * as signalR from "@microsoft/signalr";
import type { Message } from "../types/Message";

let connection: signalR.HubConnection;

type ReceiveCallback = (message: Message) => void;
type StatusCallback = (status: string) => void;

export const startConnection = (token: string, onReceive: ReceiveCallback, setStatus: StatusCallback) => {
    connection = new signalR.HubConnectionBuilder()
        .withUrl(`https://localhost:5001/chatHub?access_token=${token}`)
        .withAutomaticReconnect()
        .build();

    // Handle receiving messages from backend
    connection.on("ReceiveMessage", (res: { responseCode: number; message: string; data: Message; isSuccess: boolean }) => {
        if (res.isSuccess && res.data) {
            onReceive(res.data);
        } else {
            console.error("Failed to receive message:", res.message);
        }
    });

    connection.onreconnecting(() => setStatus("Reconnecting"));
    connection.onreconnected(() => setStatus("Connected"));
    connection.onclose(() => setStatus("Disconnected"));

    connection.start().then(() => setStatus("Connected")).catch(err => console.error("SignalR start error:", err));
};

export const sendToAdmin = (message: string) =>
    connection.invoke("SendMessageToAdmin", message).catch(err => console.error(err));

export const sendToUser = (userId: string, message: string) =>
    connection.invoke("SendMessageToUser", userId, message).catch(err => console.error(err));
