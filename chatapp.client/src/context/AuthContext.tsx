import React, { createContext, useEffect, useState } from "react";
import type { AuthData } from "../types/AuthResponse";

interface AuthContextType {
    user: AuthData | null;
    login: (data: AuthData) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthData | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName");
        const isAdmin = localStorage.getItem("isAdmin") === "true";

        if (token && userId && userName) {
            setUser({ token, userId, userName, isAdmin });
        }
    }, []);

    const login = (data: AuthData) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userName", data.userName);
        localStorage.setItem("isAdmin", data.isAdmin.toString());
        setUser(data);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
