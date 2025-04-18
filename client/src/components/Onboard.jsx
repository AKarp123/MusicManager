import { Typography } from "@mui/material";
import axios from "axios";
import ErrorContext from "../ErrorContext";
import { useContext, useState, useEffect } from "react";
import FileExplorer from "./FileViewer/FileExplorer";
import UserContext from "../UserProvider";

const Onboard = () => {
    const setError = useContext(ErrorContext);
    const [ directories, setDirectories ] = useState([]);
    const [ loading, setLoading ] = useState(true);

    const getDirectories = () => {
        axios
            .get("/api/listDirectories")
            .then((res) => {
                if (res.data.success) {
                    setDirectories(res.data.directories);
                    setLoading(false);
                } else {
                    setError("Failed to read directory", "error");
                }
            })
            .catch((err) => {
                console.log(err);
                setError("Failed to read directory", "error");
            });
    }
    useEffect(() => {
        getDirectories();
    }, []);

    const { user, setUser, setConfig } = useContext(UserContext);

    const setFilePath = (filePath) => {
        axios
            .post("/api/setDirectory", {
                filePath,
            })
            .then((res) => {
                console.log(res);
                setError("File path set successfully", "success");
                setConfig(res.data.config)

            })
            .catch((err) => {
                console.log(err);
                setError("Failed to set file path", "error");
            });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
                Set your media server file path to get started!
            </Typography>
            <FileExplorer setFilePath={setFilePath} options={{ directories }} />
        </div>
    );
};

export default Onboard;
