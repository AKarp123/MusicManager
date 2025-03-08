import PageBackdrop from "./PageBackdrop";
import { Container, Divider, selectClasses, Typography } from "@mui/material";
import FileExplorer from "./FileViewer/FileExplorer";
import Onboard from "./Onboard";
import UserContext from "../UserProvider";
import Upload from "./Upload";
import { useContext, useEffect, useState } from "react";
import PreProcess from "./PreProcess";
import Navbar from "./Navbar";

const Home = () => {
    const { user, config } = useContext(UserContext);
    const [view, setView] = useState(0); // 0 = upload 1 = pre process 2 = file explorer
    const [options, setOptions] = useState({
        replayGain: true,
        convertToMp3: false,
        convertHiResFlac: false,
        folders: [],
   
    });

    


    if (config.mediaFilePath === "") { // initial music setup
        return (
            <PageBackdrop>
                <Navbar />
                <Onboard />
            </PageBackdrop>
        );
    }


    return (
        <PageBackdrop>
            <Navbar />
            <Divider sx={{ marginBottom: "10px" }} />
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
                        <FileExplorer setView={setView}
                            options={options}
                            setOptions={setOptions}
                        />
                    )
                }
            </Container>
        </PageBackdrop>
    );
};

export default Home;
