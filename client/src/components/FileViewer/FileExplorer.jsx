import { useEffect, useReducer, useContext } from "react";
import { reducer } from "./reducer";
import axios from "axios";
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    TextField,
    Stack,
    Button,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ErrorContext from "../../ErrorContext";

const FileExplorer = ({setFilePath}) => {
    const [state, dispatch] = useReducer(reducer, {
        directoryList: [],
        currentDirectory: "",
    });

    const setError = useContext(ErrorContext);

    useEffect(() => {
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
                }
                
            });
    }, []);

    useEffect(() => {
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
    }, [state.currentDirectory]);

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
                    
                    <Button
                        onClick={() => setFilePath(state.currentDirectory)}
                    >
                        Select Folder
                    </Button>
                )}
            </Stack>
            <List
                sx={{
                    maxHeight: "80vh",
                    overflowY: "auto",
                }}
            >
                {state.directoryList.map((directory) => (
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
