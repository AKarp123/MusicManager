import PageBackdrop from "./PageBackdrop";
import { Container, Divider, Typography } from "@mui/material";
import FileExplorer from "./FileViewer/FileExplorer";
import Onboard from "./Onboard";
import UserContext from "../UserProvider";
import { useContext } from "react";

const Home = () => {
    const { user } = useContext(UserContext);

    console.log(user);

    if (user.config.mediaFilePath === "") {
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
                <FileExplorer />
            </Container>
        </PageBackdrop>
    );
};

export default Home;
