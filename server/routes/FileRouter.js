import { Router } from "express";
import requireLogin from "../requireLogin.js";
import ConfigModel from "../Models/ConfigModel.js";
import fs from "fs";
import path from "path";
import os from "os";
import { upload } from "../files.js";
import Ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";
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
        fs.readdir(userDirectory, { withFileTypes: true }, (err, files) => {
            if (err) {
                res.json({
                    success: false,
                    message: "Failed to read directory",
                    error: err,
                });
                return;
            }

            const directories = files
                .filter((file) => file.isDirectory())
                .map((file) => file.name);

            res.json({ success: true, directories: directories });
        });
        return;
    }

    //initial file config setup
    let userDirectory = path.join(os.homedir(), directory ? directory : "");
    fs.readdir(userDirectory, { withFileTypes: true }, (err, files) => {
        if (err) {
            res.json({
                success: false,
                message: "Failed to read directory",
                error: err,
            });
            return;
        }

        const directories = files
            .filter((file) => file.isDirectory())
            .map((file) => file.name);

        res.json({ success: true, directories: directories });
    });
});

fileRouter.post("/setFilePath", requireLogin, async (req, res) => {
    const { filePath } = req.body;
    const config = await ConfigModel.findOne({});
    config.mediaFilePath = filePath;
    await config.save();
    res.json({ success: true, message: "File directory set" });
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
    const { options } = req.body;

    if (!options) {
        res.json({ success: false, message: "No options provided" });
        return;
    }

    if (options.convertHiResFlac) {
        status[req.sessionID] = {
            message: "Converting Hi-Res to 16/44...",
        };
        for (let folder of options.folders) {
            const files = fs.readdir(`./temp/${req.sessionID}/${folder}`, {
                withFileTypes: true,
            });
            const flacFiles = files.filter(
                (file) => file.isFile() && file.name.endsWith(".flac")
            );
            let i = 1;
            for (let file of flacFiles) {
                const inputPath = path.join(
                    `./temp/${req.sessionID}/${folder}`,
                    file.name
                );
                const outputPath = path.join(
                    `./temp/${req.sessionID}/${folder}`,
                    file.name.replace(".flac", "-16.flac")
                );
                status[req.sessionID] = {
                    message: `Converting Hi-Res to 16/44... ${
                        ((i / flacFiles.length) * 100).toFixed(2)
                    }% complete`,
                };
                await new Promise((resolve, reject) => {
                    new Ffmpeg({ source: inputPath })
                        .audioFrequency(44100)
                        .outputOptions("-sample_fmt", "s16")
                        .save(outputPath)
                        .on("end", () => {
                            fs.rmSync(inputPath);
                            resolve();
                        })
                        .on("error", (err) => {
                            console.log(err);
                            reject();
                        });
                });
            }
        }
    }

    if (options.convertToMp3) {
        for (let folder of options.folders) {
            status[req.sessionID] = {
                message: `Converting ${folder} to MP3`,
            };

            const files = fs.readdirSync(
                `./temp/${req.sessionID}/${folder}`,
                {
                    withFileTypes: true,
                }
            );
            const flacFiles = files.filter(
                (file) => file.isFile() && file.name.endsWith(".flac")
            );
            let i = 1;
            for (let file of flacFiles) {
                status[req.sessionID] = {
                    message: `Converting ${folder} to MP3... ${
                        ((i / flacFiles.length) * 100).toFixed(2)
                    }% complete`,
                };
                const inputPath = path.join(
                    `./temp/${req.sessionID}/${folder}`,
                    file.name
                );
                const outputPath = path.join(
                    `./temp/${req.sessionID}/${folder}`,
                    file.name.replace(".flac", ".mp3")
                );
                try {
                    await new Promise((resolve, reject) => {
                        new Ffmpeg({ source: inputPath })
                            .audioCodec("libmp3lame")
                            .audioBitrate(320)
                            .save(outputPath)
                            .on("end", () => {
                                fs.rmSync(inputPath);
                                resolve();
                            })
                            .on("error", (err) => {
                                console.log(err);
                                reject();
                            });
                    });
                } catch (err) {
                    console.log(err);
                }
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
                res.json({
                    success: true,
                    message: "Files Processed successfully!",
                });
            }
        );
    }

    stauts[req.sessionID] = {
        message: "Files Processed successfully!",
    };
    
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
            res.end();
        }
    }, 500);

    req.on("close", () => {
        clearInterval(statusMessage);
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
