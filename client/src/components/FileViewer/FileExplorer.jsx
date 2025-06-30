import { useEffect, useReducer, useContext } from "react";
import { reducer } from "./reducer";
import axios from "axios";
import {
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    ListItemIcon,
    TextField,
    Stack,
    Button,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ErrorContext from "../../ErrorContext";
import NewDirectoryPopup from "./NewDirectoryPopup";
import SelectFoldersPopup from "./SelectFoldersPopup";

const FileExplorer = ({ setFilePath, setView, setOptions, options }) => {
    const [state, dispatch] = useReducer(reducer, {
        directoryList: [],
        currentDirectory: "",
        directoryPopup: false,
        selectPopup: false,
        folders: options.folders,
        loading: true,
    });

    const setError = useContext(ErrorContext);

    const fetchDirectories = (forceRefresh = false) => {
        if (forceRefresh) {
            axios
                .get("/api/listDirectories", {
                    params: { directory: state.currentDirectory },
                    headers: {
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                        Expires: "0",
                    },
                })
                .then((res) => {
                    if (res.data.success) {
                        dispatch({
                            type: "SET_DIRECTORY_LIST",
                            payload: res.data.directories,
                        });
                    } else {
                        setError("Failed to read directory", "error");
                        dispatch({
                            type: "SET_CURRENT_DIRECTORY",
                            payload: state.currentDirectory.slice(
                                0,
                                state.currentDirectory.lastIndexOf("/")
                            ),
                        });
                    }
                });
        } else {
            axios
                .get("/api/listDirectories", {
                    params: { directory: state.currentDirectory },
                })
                .then((res) => {
                    if (res.data.success) {
                        dispatch({
                            type: "SET_DIRECTORY_LIST",
                            payload: res.data.directories,
                        });
                    } else {
                        setError("Failed to read directory", "error");
                        dispatch({
                            type: "SET_CURRENT_DIRECTORY",
                            payload: state.currentDirectory.slice(
                                0,
                                state.currentDirectory.lastIndexOf("/")
                            ),
                        });
                    }
                });
        }
    };

    useEffect(() => {
        fetchDirectories();
        dispatch({ type: "SET_LOADING", payload: false });
    }, []);

    useEffect(() => {
        fetchDirectories();
    }, [state.currentDirectory]);

    const createNewDirectory = (directoryName) => {
        dispatch({ type: "TOGGLE_NEW_FOLDER_POPUP" });
        axios
            .post("/api/createDirectory", {
                directoryName,
                directoryPath: state.currentDirectory,
            })
            .then((res) => {
                if (res.data.success) {
                    setError("Directory created successfully", "success");
                    dispatch({
                        type: "SET_CURRENT_DIRECTORY",
                        payload: state.currentDirectory + "/" + directoryName,
                    });
                } else {
                    setError("Failed to create directory", "error");
                }
            });
    };

    const moveFolders = (directories) => {
        setError("Moving files, please wait...", "info");
        axios
            .post("/api/moveToDirectory", {
                directoryPath: state.currentDirectory,
                directories,
            })
            .then((res) => {
                if (res.data.success) {
                    setError(
                        "Files moved successfully, scan media server to see changes!",
                        "success"
                    );

                    fetchDirectories(true);

                    const folders = state.folders.filter((folder) => {
                        return !directories.includes(folder);
                    });
                    dispatch({ type: "SET_FOLDERS", payload: folders });

                    if (folders.length === 0) {
                        setOptions({
                            replayGain: true,
                            convertToMp3: false,
                            convertHiResFlac: false,
                            folders: [],
                        });
                        setView(0);
                    }
                } else {
                    setError("Failed to move files", "error");
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleNewFolderPopup = () => {
        dispatch({ type: "TOGGLE_NEW_FOLDER_POPUP" });
    };

    return (
        <>
            <Stack direction="row" spacing={2}>
                <TextField
                    disabled
                    value={state.currentDirectory}
                    fullWidth
                    sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                            color: "white", // Text color when disabled
                            WebkitTextFillColor: "white", // Chrome, Safari, Edge, Opera
                        },
                    }}
                />
                <Button
                    onClick={() =>
                        dispatch({
                            type: "SET_CURRENT_DIRECTORY",
                            payload: state.currentDirectory.slice(
                                0,
                                state.currentDirectory.lastIndexOf("/")
                            ),
                        })
                    }
                >
                    Back
                </Button>
                {setFilePath && (
                    <Button onClick={() => setFilePath(state.currentDirectory)}>
                        Select Folder
                    </Button>
                )}
                <Button
                    onClick={() =>
                        dispatch({ type: "TOGGLE_NEW_FOLDER_POPUP" })
                    }
                >
                    New Folder
                </Button>
                {state.directoryPopup && (
                    <NewDirectoryPopup
                        createNewDirectory={createNewDirectory}
                        newFolderPopup={state.directoryPopup}
                        handleClose={handleNewFolderPopup}
                    />
                )}
                {!setFilePath && (
                    <Button
                        sx={{
                            color: "lightgreen",
                        }}
                        onClick={() =>
                            dispatch({ type: "TOGGLE_SELECT_POPUP" })
                        }
                    >
                        Select Folder
                    </Button>
                )}
                {state.selectPopup && (
                    <SelectFoldersPopup
                        folders={state.folders}
                        selectPopup={state.selectPopup}
                        moveFolders={moveFolders}
                        handleClose={() =>
                            dispatch({ type: "TOGGLE_SELECT_POPUP" })
                        }
                    />
                )}
            </Stack>
            <List
                sx={{
                    maxHeight: "80vh",
                    overflowY: "auto",
                }}
            >
                {state.loading && <ListItemText primary="Loading..." />}
                {!state.loading &&
                    state.directoryList.map((directory) => (
                        <ListItem key={directory}>
                            <ListItemButton
                                onClick={() =>
                                    dispatch({
                                        type: "SET_CURRENT_DIRECTORY",
                                        payload:
                                            state.currentDirectory +
                                            "/" +
                                            directory,
                                    })
                                }
                            >
                                <ListItemIcon>
                                    <FolderIcon />
                                </ListItemIcon>

                                <ListItemText primary={directory} />
                            </ListItemButton>
                        </ListItem>
                    ))}
            </List>
        </>
    );
};

export default FileExplorer;
