import { Typography } from "@mui/material";
import axios from "axios";
import ErrorContext from "../ErrorContext";
import { useContext } from "react";
import FileExplorer from "./FileViewer/FileExplorer";
import UserContext from "../UserProvider";

const Onboard = () => {
    const setError = useContext(ErrorContext);

    const { user, setUser } = useContext(UserContext);

    const setFilePath = (filePath) => {
        axios
            .post("/api/setFilePath", {
                filePath,
            })
            .then((res) => {
                console.log(res);
                setError("File path set successfully", "success");
                setUser({
                    user: { ...user.user },
                    config: { ...user.config, mediaFilePath: filePath },
                });

            })
            .catch((err) => {
                console.log(err);
                setError("Failed to set file path", "error");
            });
    };

    return (
        <div>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
                Set your media server file path to get started!
            </Typography>
            <FileExplorer setFilePath={setFilePath} />
        </div>
    );
};

export default Onboard;
