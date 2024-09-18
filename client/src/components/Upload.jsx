import { useContext, useState } from "react";
import { FilePond, FileStatus, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { Button, Paper, Stack, Box } from "@mui/material";
import axios from "axios";
import ErrorContext from "../ErrorContext";

// Register the plugins

const Upload = ({ setView, options, setOptions }) => {
    const [files, setFiles] = useState([]);
    const setError = useContext(ErrorContext);
    

    const handleUpdateFiles = (fileItems) => {
        const files = fileItems.map((fileItem) => {
            if (fileItem.file) {
                console.log(fileItem.file.webkitRelativePath);
                return {
                    file: fileItem.file,
                    relativePath:
                        fileItem.file.webkitRelativePath.split("/")[0],
                };
            }
        });
        setFiles(files);

        // Retrieve the directory name from the first file
    };

    const handleUpload = async () => {
        const formData = new FormData();

        if (files.length === 0) {
            return;
        }

        // Append each file along with its relative path to the FormData
        files.forEach(({ file, relativePath }, index) => {
            formData.set("relativePaths", relativePath);
            if (relativePath !== formData.get("relativePaths")) {
                formData.append("relativePaths", relativePath);
            }
            formData.append("files", file); // Append the file itself

            // Append the relative path
        });

        // Send the request to the server
        console.log(formData);

        axios
            .post("/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                console.log(res.data);
            });
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
        const relativePath = file.webkitRelativePath.split("/")[0];
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
                    if (options.folders.indexOf(relativePath) === -1) {
                        setOptions({
                            ...options,
                            folders: [...options.folders, relativePath],
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
                    lableIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                    allowDirectoriesOnly={true}
                    maxParallelUploads={12}
                    credits={false}
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

                            if(files.length === 0) {
                                setError("No Files uploaded!")
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
                </Box>
            </Paper>
        </>
    );
};

export default Upload;
