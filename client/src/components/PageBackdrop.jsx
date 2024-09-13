import { Container, Paper } from "@mui/material";

const PageBackdrop = ({ children }) => {
    return (
        <Container
            maxWidth="lg"
            sx={{
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
                height: "100vh",
            
            }}
        >
            <Paper
                sx={{
                    width: "100%",
                    borderRadius: "0 0 5px 5px",
                    border: "1.5px solid #495057",
                    borderTop: "none",

                }}
            >
                {children}
            </Paper>
        </Container>
    );
};

export default PageBackdrop;
