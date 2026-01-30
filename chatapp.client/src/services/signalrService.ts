import * as signalR from "@microsoft/signalr";
import type { Message } from "../types/Message";

let connection: signalR.HubConnection;

type ReceiveCallback = (message: Message) => void;
type StatusCallback = (status: string) => void;

export const startConnection = (
    token: string,
    onReceive: ReceiveCallback,
    setStatus: StatusCallback,
    logout: () => void) => {
    connection = new signalR.HubConnectionBuilder()
        .withUrl(`http://localhost:5001/chatHub?access_token=${token}`)
        .withAutomaticReconnect()
        .build();

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

    connection.start()
        .then(() => setStatus("Connected"))
        .catch(err => {
            console.error("SignalR start error:", err)
            if (err?.message?.includes("Unauthorized")) {
                logout();
            }
        });
};


export const sendMessage = async (receiverId: string, message: string, logout: () => void) => {
    if (!connection) return;

    try {
        await connection.invoke("SendMessage", receiverId, message);
    } catch (err: any) {
        console.error("SignalR sendMessage error:", err);

        if (err?.message?.includes("Unauthorized")) {
            logout();
        }
    }
};