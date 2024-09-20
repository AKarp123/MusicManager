import PageBackdrop from "./PageBackdrop";
import { Container, Divider, selectClasses, Typography } from "@mui/material";
import FileExplorer from "./FileViewer/FileExplorer";
import Onboard from "./Onboard";
import UserContext from "../UserProvider";
import Upload from "./Upload";
import { useContext, useState } from "react";
import PreProcess from "./PreProcess";

const Home = () => {
    const { user, config } = useContext(UserContext);
    const [view, setView] = useState(0); // 0 = upload 1 = pre process 2 = file explorer
    const [options, setOptions] = useState({
        replayGain: true,
        convertToMp3: false,
        convertHiResFlac: false,
        folders: [],
   
    });

    console.log(config.mediaFilePath)
    if (config.mediaFilePath === "") { // initial music setup
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
                {
                    view === 0 ? (
                    <Upload setView={setView} options={options} setOptions={setOptions}/>
                    ) : view === 1 ? (
                        <PreProcess
                            options={options}
                            setOptions={setOptions}
                            setView={setView}
                        />
                    ) : (
                        <FileExplorer setView={setView}/>
                    )
                }
            </Container>
        </PageBackdrop>
    );
};

export default Home;
