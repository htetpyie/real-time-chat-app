import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import type { JSX } from "react/jsx-runtime";

export const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { user } = useContext(AuthContext)!;

    if (!user) return <Navigate to="/login" replace />;

    return children;
};
