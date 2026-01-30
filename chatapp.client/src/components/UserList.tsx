import React from "react";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import type { User } from "../types/User";

interface UserListProps {
    users: User[];
    selectedUserId: string | null;
    onSelect: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, selectedUserId, onSelect }) => (
    <List>
        {users.map(u => (
            <ListItem key={u.userId} disablePadding>
                <ListItemButton selected={u.userId === selectedUserId} onClick={() => onSelect(u.userId)}>
                    <ListItemText primary={u.userName} />
                </ListItemButton>
            </ListItem>
        ))}
    </List>
);
