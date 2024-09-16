import PageBackdrop from "./PageBackdrop";
import { Container, Divider, Typography } from "@mui/material";
import FileExplorer from "./FileViewer/FileExplorer";
import Onboard from "./Onboard";
import UserContext from "../UserProvider";
import Upload from "./Upload";
import { useContext, useState } from "react";

const Home = () => {
    const { user, config } = useContext(UserContext);
    const [sessionId, setSessionId] = useState("");
    const [view, setView] = useState(0); // 0 = upload 1 = file explorer



    if (config.mediaFilePath === "") {
        return (
            <PageBackdrop>
                <Typography variant="h3" sx={{ textAlign: "center" }}>
                    Music Manager
                </Typography>
                <Onboard />
            </PageBackdrop>
        );
    }

    return (
        <PageBackdrop>
            <Typography variant="h3" sx={{ textAlign: "center" }}>
                Music Manager
            </Typography>
            <Divider sx={{ margin: "10px 0" }} />
            <Container>
                {view === 0 ? <Upload /> : <FileExplorer />}
            </Container>
        </PageBackdrop>
    );
};

export default Home;
