import { Message } from '@/types/api';
import { useAuthStore } from '@/stores/auth-store';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const user = useAuthStore((state) => state.user);
    const isMine = message.senderId === user?.userId;

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${isMine
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                    }`}
            >
                <p className="text-sm">{message.message}</p>
                <span className="text-xs opacity-70 mt-1 block">
                    {message.sentDateString}
                </span>
            </div>
        </div>
    );
}