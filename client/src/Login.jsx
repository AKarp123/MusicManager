import { Paper, Typography, Container, Stack } from "@mui/material";

const Login = () => {
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
                    display: "flex",
                    justifyContent: "center",
                    margin: "0 auto",
                    border: "1.5px solid #495057",
                    borderRadius: "10px"
                }}
            >
                <Stack spacing={2} direction={"column"} sx={{textAlign: "center"}}>
                    <Typography variant={"h4"}>Login</Typography>
                    <Typography variant={"body1"}>This is the login page</Typography>
                </Stack>
            </Paper>
        </Container>
    );
};

export default Login;
