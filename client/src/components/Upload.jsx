import { useState } from "react";
import { FilePond, FileStatus, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { Button, Paper } from "@mui/material";
import axios from "axios";

// Register the plugins

const Upload = () => {
    const [files, setFiles] = useState([]);

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

        if(files.length === 0) {    
            return;
        }


        // Append each file along with its relative path to the FormData
        files.forEach(({ file, relativePath }, index) => {
            
            formData.set("relativePaths", relativePath);
            if(relativePath !== formData.get("relativePaths")) {
                
                formData.append("relativePaths", relativePath);
            }
            formData.append("files", file); // Append the file itself
            
          // Append the relative path
        });
          
        // Send the request to the server
        console.log(formData)
        
        axios.post("/api/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then((res) => {
            console.log(res.data);
        })

        
    };

    const handleFileUpload = (fieldName, file, metadata, load, error, progress, abort) => {

        const formData = new FormData();
        const relativePath = file.webkitRelativePath.split("/")[0];
        formData.set("relativePaths", relativePath);
        formData.append(fieldName, file, file.name);
        console.log(metadata)
        
        /**
         * 
         * Note for future self, spent like 4 hours trying to bulk upload everything at once when i could've 
         * just uploaded one at a time.
         * and the code is 10x simpler and cleaner
         * 
         */

        axios.post("/api/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Accept": "utf-8",
            },
            onUploadProgress: (e) => {
                progress(e.lengthComputable, e.loaded, e.total);
            },
            cancelToken: new axios.CancelToken((c) => {
                abort = c;
            })

        }).then((res) => {
            load(res.data.file);
        }).catch((err) => {
            error("Upload failed");
        }
        
        )
        
    }

    return (
        
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
                maxParallelUploads={10}
                credits={false}
                
            />
          
    );
};

export default Upload;
