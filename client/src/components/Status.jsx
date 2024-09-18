import { useState } from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";

const Status = ({ statusMessage }) => {
    return (
        <Box>
            <Paper
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "1rem",
                    textAlign: "center",
                }}
            >
                <Stack direction="column" spacing={2}>
                    <Typography variant="h5">Status</Typography>
                    <Typography variant="body1">
                        {statusMessage ? statusMessage : "Nothing yet..."}
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

export default Status;
