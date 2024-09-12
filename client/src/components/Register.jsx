import { useEffect, useState, useContext } from "react";
import { Paper, Typography, Container, Stack, TextField, Button } from "@mui/material";
import axios from "axios";
import UserContext from "../UserProvider";
import ErrorContext from "../ErrorContext";
import { useHistory } from "react-router-dom";


const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const setError = useContext(ErrorContext);
    const history = useHistory();
    const { user, setUser } = useContext(UserContext);


    useEffect(() => {
        if(user !== "Complete Configuration") {
            history.replace("/")
        }
    }
    , [user, history])

    const register = () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        axios.post("/api/register", { username, password })
            .then((res) => {
                if(!res.data.success) {
                    setError(res.data.message);
                    return;
                }
                setError("User Created!", "success");
                setUser(res.data.user);
            })
            .catch((err) => {
                console.log(err);
            });
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
                    height: { xs: "85%", sm: "70%" },
                    width: { xs: "100%", sm: "70%" },
                    padding: 2,
                    display: "flex",
                    justifyContent: "center",
                    margin: "0 auto",
                    border: "1.5px solid #495057",
                    borderRadius: "10px",
                }}
            >
                <Stack
                    spacing={2}
                    direction={"column"}
                    sx={{ textAlign: "center" }}
                >
                    <Typography variant={"h4"}>Welcome to Music Manager!</Typography>
                    <Typography variant={"body1"}>
                        Create your account to get started!
                    </Typography>
                    <TextField label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    <TextField label="Password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} type="password"/>
                    <TextField label="Confirm Password" variant="outlined" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password"/>
                    <Button variant="contained" color="primary" sx={{maxWidth: "30%", alignSelf: "center"}} onClick={register}>Register</Button>

                </Stack>
            </Paper>
        </Container>
    );
};

export default Register;
