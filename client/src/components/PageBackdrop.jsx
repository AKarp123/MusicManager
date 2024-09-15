import { Container, Paper } from "@mui/material";

const PageBackdrop = ({ children }) => {
    return (
        <Container
            maxWidth="lg"
            sx={{
                
                justifyContent: "center",
                display: "flex",
                flexDirection: "column",
                height: "100vh"
            
            }}
        >
            <Paper
                sx={{
                    margin: "0 auto",
                    width: "100%",
                    height: "100%",
                    borderRadius: "5px",
                    border: "1.5px solid #495057",
                

                }}
            >
                {children}
            </Paper>
        </Container>
    );
};

export default PageBackdrop;
