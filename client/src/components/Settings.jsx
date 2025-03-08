import {
    Divider,
    Typography,
    List,
    ListItem,
    TextField,
    Button,
    MenuList,
    inputLabelClasses,
} from "@mui/material";
import Navbar from "./Navbar";
import PageBackdrop from "./PageBackdrop";
import { useContext, useEffect, useState, useRef } from "react";
import UserContext from "../UserProvider";
import axios from "axios";
import ErrorContext from "../ErrorContext";

const Settings = () => {
    const { user } = useContext(UserContext);
    const [config, setConfig] = useState({});
    const [mediaFilePath, setMediaFilePath] = useState("");
    const [dirList, setDirList] = useState([]);
    const [watchFolderPath, setWatchFolderPath] = useState("");
    const [loading, setLoading] = useState(true);
    const textFieldRef = useRef(null);
    const setError = useContext(ErrorContext);
    

    useEffect(() => {
        axios.get("/api/config").then((res) => {
            setConfig(res.data.config);
            setMediaFilePath(res.data.config.mediaFilePath);
            setWatchFolderPath(res.data.config.watchFolderPath);
            setLoading(false);
        });
    }, []);
    
    const updateMediaFilePath = (e) => {
        e?.preventDefault();
        axios.patch("/api/config/mediafilepath", { mediaFilePath }).then((res) => {
            if (res.data.success) {
                setError("Media File Path Updated", "success");
            } else {
                setError("Path Not Found", "error");
            }
        });
    }

    const updateWatchFolderPath = (e) => {
        e?.preventDefault();
        axios.patch("/api/config/watchfolderpath", { watchFolderPath }).then((res) => {
            if (res.data.success) {
                setError("Watch Folder Path Updated", "success");
            }
            else {
                setError("Path Not Found", "error");
            }
        });
    }

    

    if (loading) {
        return (
            <PageBackdrop>
                <Typography>Loading...</Typography>
            </PageBackdrop>
        );
    }
    return (
        <PageBackdrop>
            <Navbar />
            <Divider sx={{ marginBottom: "10px" }} />
            <Typography variant="h4" sx={{ textAlign: "center" }}>
                Settings
            </Typography>
            <List>
                <ListItem sx={{ alignItems: "center" }}>
                    <form onSubmit={updateMediaFilePath}>
                        <TextField
                            value={mediaFilePath}
                            onChange={(e) => setMediaFilePath(e.target.value)}
                            sx={{
                                marginRight: "10px",
                                height: "56px",
                                "& .MuiInputBase-root": { height: "56px" },
                            }}
                            label="Media File Path"
                            ref={textFieldRef}
                        />
                        <Button
                            variant="text"
                            color="primary"
                            sx={{
                                height: "56px",
                                marginRight: "10px",
                            }}
                            onClick={updateMediaFilePath}
                        >
                            Change Path
                        </Button>
                    </form>
                </ListItem>

                <ListItem sx={{ alignItems: "center" }}>
                    <form onSubmit={updateWatchFolderPath}>
                        <TextField
                            value={watchFolderPath}
                            sx={{
                                marginRight: "10px",
                                height: "56px",
                                "& .MuiInputBase-root": { height: "56px" },
                            }}
                            onChange={(e) => setWatchFolderPath(e.target.value)}

                            label="Watch Folder"
                        />
                        <Button
                            variant="text"
                            color="primary"
                            sx={{
                                height: "56px",
                                marginRight: "10px",
                            }}
                            onClick={updateWatchFolderPath}
                        >
                            Change Path
                        </Button>
                    </form>
                </ListItem>
            </List>
        </PageBackdrop>
    );
};

export default Settings;
