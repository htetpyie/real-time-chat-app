import React, { useState, useContext } from "react";
import ChatBubbleIcon from '@mui/icons-material/LiveHelp';
import { useNavigate } from "react-router-dom";
import { registerApi } from "../api/authApi";
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

const Register: React.FC = () => {
    const { login } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async () => {
        setError(""); // reset error
        try {
            const res = await registerApi({ username, password });

            if (res.data.isSuccess) {
                setSuccess(res.data.message || "Register successful. Please login.");
                //navigate("/login");
            } else {
                setError(res.data.message || "Register failed.");
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
                    Register
                </Typography>

                <Box
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleRegister();
                    }}
                    display="flex"
                    flexDirection="column"
                    gap={2}
                >
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

                    <Button type="submit" variant="contained" color="primary" onClick={handleRegister}>
                        Register
                    </Button>

                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success} </Alert>}

                </Box>

                <Typography
                    variant="body2"
                    align="center"
                    sx={{ marginTop: 2, cursor: "pointer", color: "blue" }}
                    onClick={() => navigate("/login")}
                >
                    Have an account? Login
                </Typography>
            </Paper>
        </Container>
    );
};

export default Register;
