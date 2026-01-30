import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

const Login: React.FC = () => {
    const { login } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const res = await loginApi({ username, password });

            if (res.data.isSuccess && res.data.data) {
                login(res.data.data);

                if (res.data.data.isAdmin) navigate("/admin-chat");
                else navigate("/");
            } else {
                setError(res.data.message || "Login failed");
            }
        } catch (err) {
            setError("Server error. Try again later.");
        }
    };

    return (
        <div>
            <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Login;
