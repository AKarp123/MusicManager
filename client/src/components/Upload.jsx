import { useState } from "react";
import { FilePond, FileStatus, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { Button } from "@mui/material";
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

        let relativePath = files[0].relativePath.split("/")[0];


        // Append each file along with its relative path to the FormData
        files.forEach(({ file, relativePath }, index) => {
            
            formData.set("relativePaths", relativePath);
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

    return (
        <div>
            <FilePond
                files={files.map((file) => file.file)}
                onupdatefiles={handleUpdateFiles}
                allowMultiple={true}
                chunkUploads={false}
                instantUpload={false}
                server={{
                    process: {
                        url: "/api/upload",
                        method: "POST",
                    },
                    fetch: null,
                    revert: null,
                }}
                name="file"
                lableIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                allowDirectoriesOnly={true}
                
            />
            <Button onClick={handleUpload}>Upload</Button>
        </div>
    );
};

export default Upload;
