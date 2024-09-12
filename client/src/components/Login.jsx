import {
    Paper,
    Typography,
    Container,
    Stack,
    TextField,
    Button,
} from "@mui/material";
import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import UserContext from "../UserProvider";
import axios from "axios";
import ErrorContext from "../ErrorContext";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { user, setUser } = useContext(UserContext);
    const setError = useContext(ErrorContext);

    const login = () => {
        
        axios
            .post("/api/login", { username, password })
            .then((res) => {
                if (!res.data.success) {
                    setError(res.data.message);
                    return;
                }
                setUser(res.data.user);
                setError("You have been successfully logged in", "success");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const history = useHistory();
    const { from } = location.state || { from: { pathname: "/" } };

    if (user !== null) {
        history.push(from);
    }

    return (
        <Container
            sx={{
                display: "flex",
                justifyContent: "center",
                height: "100vh",
                flexDirection: "column",
            }}
        >
            <Paper
                sx={{
                    height: { xs: "55%", sm: "450px" },
                    width: { xs: "90%", sm: "450px" },
                    padding: 2,
                    justifyContent: "center",
                    margin: "0 auto",
                    border: "1.5px solid #495057",
                    borderRadius: "10px",
                }}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log("Login");
                    }}
                >
                    <Stack
                        spacing={2}
                        direction={"column"}
                        sx={{
                            textAlign: "center",
                            maxWidth: "75%",
                            margin: "0 auto",
                        }}
                    >
                        <Typography variant={"h4"}>Login</Typography>
                        <TextField
                            label={"Username"}
                            variant={"outlined"}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            label={"Password"}
                            variant={"outlined"}
                            value={password}
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button variant={"contained"} onClick={login}>
                            Login
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
};

export default Login;
