import { useContext, useState } from "react";
import { FilePond, FileStatus, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { Button, Paper, Stack, Box } from "@mui/material";
import axios from "axios";
import ErrorContext from "../ErrorContext";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileMetadata from "filepond-plugin-file-metadata";

// Register the plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileMetadata);


const Upload = ({ setView, options, setOptions }) => {
    const [files, setFiles] = useState([]);
    const setError = useContext(ErrorContext);
    const [relativePath, setRelativePath] = useState("");
    

    const handleUpdateFiles = (fileItems) => {
        const files = fileItems.map((fileItem, i) => {
            if (fileItem.file) {
                // console.log(fileItem.file.webkitRelativePath );
                return {
                    file: fileItem.file,
                    relativePath:
                        fileItem.relativePath,
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

        
        //check if file is a blob
        
        
        const relativePath = file._relativePath || file.webkitRelativePath.split("/").slice(0, -1).join("/");
        console.log(relativePath);
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
                    const topFolder = relativePath.split("/")[0]; //ignore subfolders treat a folder as top level if it has subfolders
                    if (options.folders.indexOf(topFolder) === -1) {
                        setOptions({
                            ...options,
                            folders: [...options.folders, topFolder],
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
                    labelIdle='Click <span class="filepond--label-action">Browse</span> to upload (directories only)'
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
