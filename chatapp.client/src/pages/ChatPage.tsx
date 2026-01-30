import React, { useEffect, useState, useContext } from "react";
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { AuthContext } from "../context/AuthContext";
import { getUserList } from "../api/chatApi";
import { UserList } from "../components/UserList";
import { ChatWindow } from "../components/ChatWindow";
import type { User } from "../types/User";

const ChatPage: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {

        const loadUsers = async () => {
            try {
                const list = await getUserList();
                setUsers(list);
                if (list.length > 0) setSelectedUserId(list[0].userId);
            } catch (err) {
                console.error(err);
            }
        };
        loadUsers();
    }, [user]);

    if (!user) return null;

    return (

        <Grid container spacing={2} sx={{ height: "600px", width:"500px" }}>
            <Grid size={3} sx={{ borderRight: "1px solid #ccc" }}>
                <UserList users={users} selectedUserId={selectedUserId} onSelect={setSelectedUserId} />
            </Grid>
            <Grid size={9}>
                <ChatWindow selectedUserId={selectedUserId} isAdmin={user.isAdmin} />
            </Grid>
        </Grid>

    );
};

export default ChatPage;
