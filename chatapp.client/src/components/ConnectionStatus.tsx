import React from "react";
import { Box, Typography } from "@mui/material";

export const ConnectionStatus: React.FC<{ status: string }> = ({ status }) => (
    <Box sx={{ textAlign: "center", p: 1 }}>
        <Typography variant="body2">
            {status === "Connected" && "🟢 Connected"}
            {status === "Reconnecting" && "🟡 Reconnecting"}
            {status === "Disconnected" && "🔴 Disconnected"}
        </Typography>
    </Box>
);
