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
    const { config } = useContext(UserContext);
    const [mediaFilePath, setMediaFilePath] = useState(config.mediaFilePath);
    const [watchFolderPath, setWatchFolderPath] = useState(config.watchFolderPath);
    const textFieldRef = useRef(null);
    const setError = useContext(ErrorContext);
    const [password, setPassword] = useState("");

    

    const updateMediaFilePath = (e) => {
        e?.preventDefault();
        axios
            .patch("/api/config/mediafilepath", { mediaFilePath })
            .then((res) => {
                if (res.data.success) {
                    setError("Media File Path Updated", "success");
                } else {
                    setError("Path Not Found", "error");
                }
            });
    };

    const updateWatchFolderPath = (e) => {
        e?.preventDefault();
        axios
            .patch("/api/config/watchfolderpath", { watchFolderPath })
            .then((res) => {
                if (res.data.success) {
                    setError("Watch Folder Path Updated", "success");
                } else {
                    setError("Path Not Found", "error");
                }
            });
    };

    const updatePassword = (e) => {
        e.preventDefault();
        axios.patch("/api/user/password", { password }).then((res) => {
            if (res.data.success) {
                setError("Password Updated", "success");
            } else {
                setError("Failed to Update Password", "error");
            }
        });
        setPassword("");
    };

    
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
                            type="submit"
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
                            type="submit"
                        >
                            Change Path
                        </Button>
                    </form>
                </ListItem>
                <ListItem sx={{ alignItems: "center" }}>
                    <form onSubmit={updatePassword}>
                        <TextField
                            value={password}
                            sx={{
                                marginRight: "10px",
                                height: "56px",
                                "& .MuiInputBase-root": { height: "56px" },
                            }}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            label="Password"
                        />
                        <Button
                            variant="text"
                            color="primary"
                            sx={{
                                height: "56px",
                                marginRight: "10px",
                            }}
                            type="submit"
                        >
                            Change Password
                        </Button>
                    </form>
                </ListItem>
            </List>
        </PageBackdrop>
    );
};

export default Settings;
