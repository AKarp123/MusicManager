import { useEffect, useState } from "react";
import { Paper, Typography, Container, Stack, TextField } from "@mui/material";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    



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
                    <TextField label="Password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        
                </Stack>
            </Paper>
        </Container>
    );
};

export default Register;
