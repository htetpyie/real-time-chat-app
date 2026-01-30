import React, { useState, useContext } from "react";
import ChatBubbleIcon from '@mui/icons-material/LiveHelp';
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { AuthContext } from "../context/AuthContext";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Alert,
} from "@mui/material";

const Login: React.FC = () => {
    const { login } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError(""); // reset error
        try {
            const res = await loginApi({ username, password });

            if (res.data.isSuccess && res.data.data) {
                login(res.data.data);

                if (res.data.data.isAdmin) navigate("/admin-chat");
                else navigate("/chat");
            } else {
                setError(res.data.message || "Login failed");
            }
        } catch (err) {
            setError("Server error. Try again later.");
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8, textAlign: 'center' }}>

                <ChatBubbleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />

                <Typography variant="h6" align="center" gutterBottom>
                    Login
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button variant="contained" color="primary" onClick={handleLogin}>
                        Login
                    </Button>

                    {error && <Alert severity="error">{error}</Alert>}
                </Box>

                <Typography
                    variant="body2"
                    align="center"
                    sx={{ marginTop: 2, cursor: "pointer", color: "blue" }}
                    onClick={() => navigate("/register")}
                >
                    Don't have an account? Register
                </Typography>
            </Paper>
        </Container>
    );
};

export default Login;
