import { Router } from "express";
import requireLogin from "../requireLogin.js";
import ConfigModel from "../Models/ConfigModel.js";
import fs from "node:fs/promises";
import path from "path";
import os from "os";
import { upload } from "../files.js";
import Ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";
import recursiveReadDir from "recursive-readdir";
const fileRouter = Router();
const status = {};

fileRouter.get("/listDirectories", requireLogin, async (req, res) => {
    const config = await ConfigModel.findOne({});

    const { directory } = req.query;

    if (config.mediaFilePath !== "") {
        let userDirectory = path.join(
            os.homedir(),
            config.mediaFilePath,
            directory ? directory : ""
        ); //media server path + subdirectory
        fs.readdir(userDirectory, { withFileTypes: true })
            .then((files) => {
                const directories = files
                    .filter((file) => file.isDirectory())
                    .map((directory) => directory.name);

                res.json({ success: true, directories: directories });
            })
            .catch((err) => {
                res.json({
                    success: false,
                    message: "Failed to read directory",
                    error: err,
                });
            });
        return;
    }

    //initial file config setup
    let userDirectory = path.join(os.homedir(), directory ? directory : "");

    fs.readdir(userDirectory, { withFileTypes: true })
        .then((files) => {
            const directories = files
                .filter((file) => file.isDirectory())
                .map((directory) => directory.name);

            res.json({ success: true, directories: directories });
        })
        .catch((err) => {
            res.json({
                success: false,
                message: "Failed to read directory",
                error: err,
            });
        });
});

fileRouter.post("/createDirectory", requireLogin, async (req, res) => {
    const { directoryName, directoryPath } = req.body;

    const config = await ConfigModel.findOne({});
    const userDirectory = path.join(
        os.homedir(),
        config.mediaFilePath,
        directoryPath
    );

    fs.mkdir(path.join(userDirectory, directoryName), { recursive: true })
        .then((folder) => {
            res.json({
                success: true,
                message: path.join(userDirectory, directoryName),
            });
        })
        .catch((err) => {
            res.json({
                success: false,
                message: "Failed to create directory",
                error: err,
            });
        });
});

fileRouter.post("/setDirectory", requireLogin, async (req, res) => {
    const { filePath } = req.body;
    const config = await ConfigModel.findOne({});
    config.mediaFilePath = filePath;
    await config.save();
    res.json({ success: true, message: "File directory set", config });
});

fileRouter.post(
    "/upload",
    requireLogin,
    upload.array("files", 100),
    async (req, res) => {
        //check if temp/sessionid exists otherwise make it
        try {
            // console.log("Uploaded directory name:", directoryName);

            const filePaths = req.files.map(
                (file) => `./temp/${req.sessionID}/${file.filename}`
            );
            res.json({ success: true, filePaths });
        } catch (err) {
            res.json({ success: false, message: "Failed to upload file" });
        }
        // res.json({ success: true, message: "Folder uploaded" });
    }
);

fileRouter.post("/process", requireLogin, async (req, res) => {
    const { options, selectedFolders } = req.body;

    if (!options) {
        res.json({ success: false, message: "No options provided" });
        return;
    }

    try {
        if (options.convertHiResFlac) {
            status[req.sessionID] = {
                message: "Converting Hi-Res to 16/44...",
            };
            for (let folder of selectedFolders) {
                // const files = await fs.readdir(
                //     `./temp/${req.sessionID}/${folder}`,
                //     {
                //         withFileTypes: true,
                //         recursive: true,
                //     }
                // );
                const allFiles = await recursiveReadDir(`./temp/${req.sessionID}/${folder}`)
                const flacFiles = allFiles.filter(
                    (file) => file.endsWith(".flac")
                );
                
                // const flacFiles = allFiles.filter(
                //     (file) => file.isFile() && file.name.endsWith(".flac")
                // );

        
                let i = 0;

                for (let file of flacFiles) {
                    
                    // const inputPath = path.join(
                    //     `./temp/${req.sessionID}/${folder}`,
                    //     file.name
                    // );
                    // const outputPath = path.join(
                    //     `./temp/${req.sessionID}/${folder}`,
                    //     file.name.replace(".flac", "-16.flac")
                    // );

                    const inputPath = file;
                    const outputPath = file.replace(".flac", "-16.flac");

                    //keep structure of subfolders

                    status[req.sessionID] = {
                        message: `Converting Hi-Res to 16/44... ${(
                            (i / flacFiles.length) *
                            100
                        ).toFixed(2)}% complete`,
                    };

                    //check if file is already 16/44
                    const probe = await new Promise((resolve, reject) => {
                        new Ffmpeg({ source: inputPath }).ffprobe(
                            (err, data) => {
                                if (err) {
                                    reject(err);
                                }
                                // console.log("file is already 16bit")

                                resolve(data);
                            }
                        );
                    });
                    if (probe.streams[0].sample_fmt === "s16") {
                        i++;
                        continue;
                    }
                    await new Promise((resolve, reject) => {
                        new Ffmpeg({ source: inputPath })
                            .audioFrequency(44100)
                            .outputOptions("-sample_fmt", "s16")
                            .save(outputPath)
                            .on("end", () => {
                                fs.rm(inputPath)
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        reject();
                                    });
                            })
                            .on("error", (err) => {
                                console.log(err);
                                reject();
                            });
                    });
                    i++;
                }
            }
        }

        if (options.convertToMp3) {
            for (let folder of selectedFolders) {
                status[req.sessionID] = {
                    message: `Converting ${folder} to MP3`,
                };

                // const files = await fs.readdir(
                //     `./temp/${req.sessionID}/${folder}`,
                //     {
                //         withFileTypes: true,
                //     }
                // );
                // const flacFiles = files.filter(
                //     (file) => file.isFile() && file.name.endsWith(".flac")
                // );

                const allFiles = await recursiveReadDir(`./temp/${req.sessionID}/${folder}`)
                const flacFiles = allFiles.filter(
                    (file) => file.endsWith(".flac")
                );
                

                let i = 0;
                for (let file of flacFiles) {
                    status[req.sessionID] = {
                        message: `Converting ${folder} to MP3... ${(
                            (i / flacFiles.length) *
                            100
                        ).toFixed(2)}% complete`,
                    };
                    const inputPath = file;
                    const outputPath = file.replace(".flac", ".mp3");

                    await new Promise((resolve, reject) => {
                        new Ffmpeg({ source: inputPath })
                            .audioCodec("libmp3lame")
                            .audioBitrate(320)
                            .save(outputPath)
                            .on("end", () => {
                                console.log(file);
                                fs.rm(inputPath)
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        reject();
                                    });
                            })
                            .on("error", (err) => {
                                console.log(err);
                                reject();
                            });
                    });


                    i++;
                }
            }
        }

        if (options.replayGain) {
            status[req.sessionID] = {
                message: "Applying ReplayGain",
            };
            exec(
                `rsgain easy -m MAX ./temp/${req.sessionID}`,
                (err, stdout, stderr) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(stdout);
                    console.log(stderr);
                    status[req.sessionID] = {
                        message: "Files Processed successfully!",
                    };
                    res.json({
                        success: true,
                        message: "Files Processed successfully!",
                    });
                }
            );
        }
    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: "Failed to process files",
            error: err,
        });
    }
});

fileRouter.get("/status", requireLogin, async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const statusMessage = setInterval(() => {
        status[req.sessionID];

        if (status[req.sessionID]) {
            res.write(`data: ${JSON.stringify(status[req.sessionID])}\n\n`);
        }

        if (
            status[req.sessionID] &&
            status[req.sessionID].message === "Files Processed successfully!"
        ) {
            clearInterval(statusMessage);
            status[req.sessionID] = null;
            res.end();
        }
    }, 500);

    req.on("close", () => {
        clearInterval(statusMessage);
    });
});

fileRouter.post("/moveToDirectory", requireLogin, async (req, res) => {
    const { directoryPath } = req.body;

    const config = await ConfigModel.findOne({});

    const outputDirectory = path.join(
        os.homedir(),
        config.mediaFilePath,
        directoryPath
    );

    fs.cp(`./temp/${req.sessionID}`, outputDirectory, { recursive: true })
        .then(() => {
            fs.rm(`./temp/${
                req.sessionID
            }`, { recursive: true })
                .then(() => {
                    res.json({ success: true, message: "Files moved successfully" });
                })
                .catch((err) => {
                    res.json({ success: false, message: "Failed to move files", err });
                });
        })
        .catch((err) => {
            res.json({ success: false, message: "Failed to move files", err });
        });
});

// fileRouter.post("/upload", requireLogin, upload.array("files"), (req, res) => {
//     try {
//         const relativePaths = Object.values(req.body.relativePaths); // Extract relative paths as an array
//         const uploadedFiles = req.files; // Array of uploaded files

//         // Check if files were uploaded
//         if (!uploadedFiles) {
//             return res.status(400).json({ message: "No files uploaded" });
//         }

//         // Loop over each file and save it to the appropriate folder
//         uploadedFiles.forEach((file, index) => {
//             const relativePath = relativePaths[index];
//             const targetDir = path.join(
//                 __dirname,
//                 "temp",
//                 path.dirname(relativePath)
//             ); // Construct the target directory
//             const targetFile = path.join(__dirname, "temp", relativePath); // Full path to the file

//             // Create the target directory if it doesn't exist
//             createDirectory(targetDir);

//             // Save the file to the correct location
//             fs.writeFileSync(targetFile, file.buffer); // Use file.buffer since we are using memoryStorage in multer
//         });

//         res.json({
//             message:
//                 "Files uploaded and saved to respective directories successfully!",
//         });
//     } catch (error) {
//         res.status(500).json({ message: "File upload failed", error });
//     }
// });

export default fileRouter;
