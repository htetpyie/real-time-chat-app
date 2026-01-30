import React from "react";

export const ConnectionStatus: React.FC<{ status: string }> = ({ status }) => (
    <div>
        {status === "Connected" && "🟢 Connected"}
        {status === "Reconnecting" && "🟡 Reconnecting"}
        {status === "Disconnected" && "🔴 Disconnected"}
    </div>
);
