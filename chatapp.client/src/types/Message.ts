export interface Message {
    chatId: number;
    senderId: string;
    receiverId: string;
    message: string;
    sentDateString: string;
    isRead: boolean;
}
