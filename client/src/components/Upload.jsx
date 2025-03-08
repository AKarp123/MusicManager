import { useContext, useState, useEffect } from "react";
import { FilePond, FileStatus, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import {
    Button,
    Paper,
    Stack,
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Tab,
    Tabs,
    styled,
    LinearProgress,
} from "@mui/material";
import axios from "axios";
import ErrorContext from "../ErrorContext";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileMetadata from "filepond-plugin-file-metadata";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Register the plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileMetadata);

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const Upload = ({ setView, options, setOptions }) => {
    const [files, setFiles] = useState([]);
    const setError = useContext(ErrorContext);
    const [watchPopup, setWatchPopup] = useState(false);
    const [tab, setTab] = useState(1);
    const [zipFiles, setZipFiles] = useState([]);

    useEffect(() => {
        axios.get("/api/watchfolder").then((res) => {
            if (res.data.success) {
                setWatchPopup(res.data.newFolderFound);
            }
        });
    }, []);

    const handleWatchPopup = () => {
        setWatchPopup(false);
        setError("Moving Watch Folders", "info");
        axios.get("/api/watchfolder/copy").then((res) => {
            if (res.data.success) {
                setError("Watch Folders Moved", "success");
                options.folders = options.folders.concat(
                    res.data.copiedFolders
                ); // Add watch folders to options
            } else {
                setError("Failed to move folders", "error");
            }
        });
    };

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
                return {
                    file: fileItem.file,
                    relativePath: fileItem.relativePath,
                };
            }
        });
        setFiles(files);
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
        const relativePath =
            file._relativePath.split("/").slice(0, -1).join("/") ||
            file.webkitRelativePath.split("/").slice(0, -1).join("/");
        console.log(file);

        formData.set("relativePaths", relativePath);
        formData.append(fieldName, file, file.name);

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
                        relativePath.split("/")[1];
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

    const handleZipUpload = (e) => {
        e.preventDefault();

        let files;
        // console.log(e.type);
        if (e.type === "drop") {
            files = e.dataTransfer.files;
        } else {
            files = e.target.files;
        }

        //check if the file is a zip file
        if (files[0].type !== "application/zip") {
            setError("Please upload a zip file", "error");
            return;
        }

        const zipFile = files[0];
        const formData = new FormData();
        formData.append("file", zipFile);
        setZipFiles([
            ...zipFiles,
            { name: zipFile.name, status: "uploading", progress: 0 },
        ]);
        axios
            .post("/api/upload/zip", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Accept: "utf-8",
                },
                onUploadProgress: (e) => {
                    const progress = Math.round((e.loaded * 100) / e.total);
                    if (progress === 100) {
                        setZipFiles((prev) => {
                            const newFiles = [...prev];
                            newFiles[newFiles.length - 1].status = "unzipping";
                            return newFiles;
                        });
                    }
                    setZipFiles((prev) => {
                        const newFiles = [...prev];
                        newFiles[newFiles.length - 1].progress = progress;
                        return newFiles;
                    });
                },
            })
            .then((res) => {
                if (res.data.success) {
                    setZipFiles((prev) => {
                        const newFiles = [...prev];
                        newFiles[newFiles.length - 1].status = "uploaded";
                        return newFiles;
                    });
                    setOptions((prev) => {
                        return {
                            ...prev,
                            folders: [...prev.folders, res.data.folder],
                        };
                    });
                }
                if (!res.data.success) {
                    setError("Upload failed");
                    setZipFiles((prev) => {
                        const newFiles = [...prev];
                        newFiles[newFiles.length - 1].status = "error";
                        return newFiles;
                    });
                }
            })
            .catch((err) => {
                setError("Upload failed");
                setZipFiles((prev) => {
                    const newFiles = [...prev];
                    newFiles[newFiles.length - 1].status = "error";
                    return newFiles;
                });
            });
    };

    return (
        <>
            <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                centered
            >
                <Tab label="Upload Folder" />
                <Tab label="Upload Zip" />
            </Tabs>
            {tab === 0 && (
                <Box sx={{ p: 2 }}>
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
                    </Paper>
                </Box>
            )}
            {tab === 1 && (
                <>
                    <Box
                        sx={{
                            p: 2,
                            my: 2,
                            display: "flex",
                            justifyContent: "center",
                            border: "2px dashed #ccc",
                            borderRadius: "8px",
                            padding: "20px",
                            textAlign: "center",
                            cursor: "pointer",
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "copy";
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleZipUpload(e);
                        }}
                    >
                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon />}
                        >
                            Upload zip
                            <VisuallyHiddenInput
                                type="file"
                                onChange={handleZipUpload}
                                name="file"
                            />
                        </Button>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                            my: zipFiles.length > 0 ? 2 : 0,
                        }}
                    >
                        {zipFiles.map((file, i) => (
                            <Paper
                                key={i}
                                sx={{
                                    position: "relative",
                                    padding: "1rem",
                                    marginBottom: "1rem",
                                    bgcolor:
                                        file.status === "uploaded"
                                            ? "success.dark"
                                            : file.status === "unzipping"
                                            ? "info.dark"
                                            : file.status === "uploading"
                                            ? "warning.dark"
                                            : "error.dark",
                                }}
                                elevation={16}
                            >
                                {file.name.replace(/\.zip$/, "")}

                                <LinearProgress
                                    variant="determinate"
                                    value={file.progress}
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        width: "100%",
                                        marginTop: 0,
                                    }}
                                />
                            </Paper>
                        ))}
                    </Stack>
                </>
            )}

            {watchPopup && (
                <Dialog open={watchPopup} onClose={() => setWatchPopup(false)}>
                    <DialogTitle>Music Folders Detected</DialogTitle>
                    <DialogContent>
                        New Folders were detected in the watch directory. Would
                        you like to process them?
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                handleWatchPopup();
                            }}
                        >
                            Yes
                        </Button>
                        <Button onClick={() => setWatchPopup(false)}>No</Button>
                    </DialogActions>
                </Dialog>
            )}
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
                        if (
                            files.length === 0 &&
                            options.folders.length === 0
                        ) {
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
                        textWrap: "noWrap",
                    }}
                >
                    Clear Temp Folder
                </Button>
            </Box>
        </>
    );
};

export default Upload;
