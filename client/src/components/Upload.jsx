import { useContext, useState, useEffect } from "react";
import { FilePond, FileStatus, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { Button, Paper, Stack, Box, Dialog, DialogContent, DialogTitle, DialogActions } from "@mui/material";
import axios from "axios";
import ErrorContext from "../ErrorContext";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileMetadata from "filepond-plugin-file-metadata";

// Register the plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileMetadata);

const Upload = ({ setView, options, setOptions }) => {
    const [files, setFiles] = useState([]);
    const setError = useContext(ErrorContext);
    const [watchPopup, setWatchPopup] = useState(false);

    useEffect(() => {   
        axios.get("/api/watchfolder").then((res) => {
            if (res.data.success) {
                setWatchPopup(res.data.newFolderFound);
            }

        })
    }, []);

    const handleWatchPopup = () => {
        setWatchPopup(false);
        setError("Moving Watch Folders", "info");
        axios.get("/api/watchfolder/copy").then((res) => {
            if(res.data.success) {
                setError("Watch Folders Moved", "success");
                options.folders = options.folders.concat(res.data.copiedFolders); // Add watch folders to options
            }
            else {
                setError("Failed to move folders", "error");
            }
        })
    }

    const clearTempFolder = async () => {
        axios.delete("/api/clearTempFolder").then((res) => {
            if (res.data.success) {
                setError("Temp folder cleared", "success");
            } else {
                setError("Failed to clear temp folder", "error");
            }
        });
    };
    const handleUpdateFiles = (fileItems) => {
        const files = fileItems.map((fileItem, i) => {
            if (fileItem.file) {
                // console.log(fileItem.file.webkitRelativePath );
                return {
                    file: fileItem.file,
                    relativePath: fileItem.relativePath,
                };
            }
        });
        setFiles(files);

        // Retrieve the directory name from the first file
    };


    const handleFileUpload = (
        fieldName,
        file,
        metadata,
        load,
        error,
        progress,
        abort
    ) => {
        const formData = new FormData();

        //check if file is a blob

        const relativePath =
            file._relativePath.split("/").slice(0, -1).join("/") ||
            file.webkitRelativePath.split("/").slice(0, -1).join("/");
        console.log(file);

        formData.set("relativePaths", relativePath);
        formData.append(fieldName, file, file.name);

        /**
         *
         * Note for future self, spent like 4 hours trying to bulk upload everything at once when i could've
         * just uploaded one at a time.
         * and the code is 10x simpler and cleaner
         *
         */

        axios
            .post("/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Accept: "utf-8",
                },
                onUploadProgress: (e) => {
                    progress(e.lengthComputable, e.loaded, e.total);
                },
                cancelToken: new axios.CancelToken((c) => {
                    abort = c;
                }),
            })
            .then((res) => {
                if (res.data.success) {
                    load(res.data.message);
                    const topFolder =
                        relativePath.split("/")[0] ||
                        relativePath.split("/")[1]; //ignore subfolders treat a folder as top
                    let folderList = options.folders;
                    if (folderList.indexOf(topFolder) === -1) {
                        folderList.push(topFolder);
                        setOptions({
                            ...options,
                            folders: folderList,
                        });
                    }
                }
            })
            .catch((err) => {
                error("Upload failed");
            });
    };

    return (
        <>
            <Paper
                sx={{
                    padding: "1rem",
                    marginBottom: "1rem",
                }}
                elevation={16}
            >
                <FilePond
                    files={files.map((file) => file.file)}
                    onupdatefiles={handleUpdateFiles}
                    allowMultiple={true}
                    chunkUploads={false}
                    instantUpload={true}
                    server={{
                        process: handleFileUpload,
                        load: null,
                        fetch: null,
                        revert: null,
                    }}
                    name="files"
                    labelIdle='Click <span class="filepond--label-action">Browse</span> to upload (directories only) or drag and drop files'
                    allowDirectoriesOnly={true}
                    maxParallelUploads={12}
                    credits={false}
                    allowFileMetadata={true}
                />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            if (files.length === 0 && options.folders.length === 0) {
                                setError("No Files uploaded!");
                                return;
                            }
                            setView(1);
                        }}
                        sx={{
                            width: "10%",
                        }}
                    >
                        Next
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={clearTempFolder}
                        sx={{
                            maxWidth: "30%",
                            marginLeft: "1rem",
                            textWrap: "noWrap"
                        }}
                    >
                        Clear Temp Folder
                    </Button>
                </Box>
                {watchPopup && (
                    <Dialog open={watchPopup} onClose={() => setWatchPopup(false)}>
                        <DialogTitle>Music Folders Detected</DialogTitle>
                        <DialogContent>
                            
                                New Folders were detected in the watch directory. Would you like to process them?
                            
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                // Add logic to move watch folders over here
                                handleWatchPopup();
                            }}>
                                Yes
                            </Button>
                            <Button onClick={() => setWatchPopup(false)}>No</Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Paper>
        </>
    );
};

export default Upload;
