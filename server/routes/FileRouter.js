import { Router } from "express";
import requireLogin from "../requireLogin.js";
import ConfigModel from "../Models/ConfigModel.js";
import fs from "node:fs/promises";
import path from "path";
import os from "os";
import { upload, uploadZip } from "../files.js";
import Ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";
import recursiveReadDir from "recursive-readdir";
import getFolderSize from "get-folder-size";
const fileRouter = Router();
const status = {};
import unzipper from "unzipper";

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

fileRouter.get("/directories", requireLogin, async (req, res) => {
    const { directory } = req.query;
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

fileRouter.delete("/clearTempFolder", requireLogin, async (req, res) => {
    fs.readdir("./temp", { withFileTypes: true })
        .then((files) => {
            files.forEach(async (file) => {
                if (file.isDirectory()) {
                    await fs.rmdir(`./temp/${file.name}`, { recursive: true });
                }
            });
            res.json({ success: true, message: "Temp folder cleared" });
        })
        .catch((err) => {
            res.json({
                success: false,
                message: "Failed to clear temp folder",
                error: err,
            });
        });
});

fileRouter.get("/watchfolder", requireLogin, async (req, res) => {
    const config = await ConfigModel.findOne({});
    const userDirectory = path.join(os.homedir(), config.watchFolderPath);

    const lastChecked = new Date(config.watchFolderLastChecked);

    if (config.watchFolderPath === "") {
        res.json({ success: false, message: "Watch folder not set" });
        return;
    }
    try {
        const entries = await fs.readdir(userDirectory, {
            withFileTypes: true,
        });
        let newFolderFound = false;

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const fullPath = path.join(userDirectory, entry.name);
                const stats = await fs.stat(fullPath);
                if (stats.mtime > lastChecked) {
                    newFolderFound = true;
                    break;
                }
            }
        }

        res.json({ success: true, newFolderFound });
    } catch (err) {
        res.json({
            success: false,
            message: "Failed to check folders",
            error: err,
        });
    }

    // try {
    //     const entries = await fs.readdir(userDirectory, { withFileTypes: true });
    //     const newFolderFound = entries.some(entry => entry.isDirectory());
    //     res.json({ success: true, newFolderFound });
    // } catch (err) {
    //     res.json({
    //         success: false,
    //         message: "Failed to check watch folder",
    //         error: err,
    //     });
    // }
});

fileRouter.get("/watchfolder/copy", requireLogin, async (req, res) => {
    const config = await ConfigModel.findOne({});
    const watchDirectory = path.join(os.homedir(), config.watchFolderPath);

    const lastChecked = new Date(config.watchFolderLastChecked);
    try {
        const entries = await fs.readdir(watchDirectory, {
            withFileTypes: true,
        });
        const newFolders = [];
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const fullPath = path.join(watchDirectory, entry.name);
                const stats = await fs.stat(fullPath);
                if (stats.mtime > lastChecked) {
                    newFolders.push(entry.name);
                }
            }
        }

        const tempSessionDir = path.join("temp", req.sessionID);
        await fs.mkdir(tempSessionDir, { recursive: true });

        for (const folder of newFolders) {
            const sourcePath = path.join(watchDirectory, folder);
            await fs.cp(sourcePath, `./temp/${req.sessionID}/${folder}`, {
                recursive: true,
            });
        }

        config.watchFolderLastChecked = new Date();
        await config.save();
        res.json({ success: true, copiedFolders: newFolders });
    } catch (err) {
        res.json({
            success: false,
            message: "Failed to copy new folders",
            error: err,
        });
    }

    // try  {
    //     const entries = await fs.readdir(watchDirectory, { withFileTypes: true });
    //     const newFolders = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
    //     const tempSessionDir = path.join("temp", req.sessionID);
    //     await fs.mkdir(tempSessionDir, { recursive: true });
    //     for (const folder of newFolders) {
    //         const sourcePath = path.join(watchDirectory, folder);
    //         await fs.cp(sourcePath, `./temp/${req.sessionID}/${folder}`, { recursive: true });
    //     }
    //     config.watchFolderLastChecked = new Date();
    //     await config.save();
    //     res.json({ success: true, copiedFolders: newFolders });
    // }
    // catch (err) {
    //     res.json({
    //         success: false,
    //         message: "Failed to copy new folders",
    //         error: err,
    //     });
    // }
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

fileRouter.post(
    "/upload/zip",
    requireLogin,
    uploadZip.single("file"),
    async (req, res) => {

        const accepedTypes = ["application/zip", "application/x-zip-compressed", "application/x-zip", "application/vnd.rar", "application/x-7z-compressed"];
        if (!req.file) {
            res.json({ success: false, message: "No file uploaded" });
            return;
        }
        if (!accepedTypes.includes(req.file.mimetype)) {
            res.json({ success: false, message: "File is not a zip file" });
            return;
        }
        const tempSessionDir = path.join("temp", req.sessionID);
        const zipPath = path.join(
            tempSessionDir,
            req.file.originalname
        );
        const extractPath = `./temp/${req.sessionID}`;
        const existingFolders = new Set(
            (await fs.readdir(extractPath, { withFileTypes: true }))
                .map((entry) => entry.name)
        );
        
        try {
            const directory = await unzipper.Open.file(zipPath);
            await directory.extract({ path: extractPath });
            await fs.rm(zipPath);
            
            const extractedItems = await fs.readdir(extractPath, { withFileTypes: true });
            const subfolders = extractedItems.filter((item) => item.isDirectory());
            const hasSingleFolder = subfolders.length === 1;
            
            if (!hasSingleFolder) {
                const zipFolderName = path.basename(zipPath, path.extname(zipPath));
                const newExtractPath = path.join(
                    extractPath,
                    Buffer.from(zipFolderName, "binary").toString("utf8")
                );
                await fs.mkdir(newExtractPath, { recursive: true });
            
                for (const item of extractedItems) {
                    const oldPath = path.join(extractPath, item.name);
                    const newPath = path.join(newExtractPath, item.name);
                    await fs.rename(oldPath, newPath);
                }
            }
            // Get a list of folders AFTER extraction
            const newFolders = new Set(
                (await fs.readdir(extractPath, { withFileTypes: true }))
                    .filter((entry) => entry.isDirectory())
                    .map((entry) => entry.name)
            );
            // Get the folder that was extracted
            const extractedFolderName = [...newFolders].filter(
                (folder) => !existingFolders.has(folder)
            )[0];
            console.log(extractedFolderName);
            res.json({
                success: true,
                folder: extractedFolderName,
            });

           
        } catch (err) {
            res.json({
                success: false,
                message: "Failed to extract zip file",
                error: err,
            });
        }
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
                const allFiles = await recursiveReadDir(
                    `./temp/${req.sessionID}/${folder}`
                );
                const flacFiles = allFiles.filter((file) =>
                    file.endsWith(".flac")
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
                    const outputPath = file.replace(".flac", ".temp.flac");

                    //keep structure of subfolders

                    status[req.sessionID] = {
                        message: `Converting ${folder} to 16bit/44.1 khz... ${(
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

                    console.log(probe);
                    if (probe.streams[0].sample_fmt === "s16") {
                        i++;
                        continue;
                    }
                    await new Promise((resolve, reject) => {
                        new Ffmpeg({ source: inputPath })
                            .audioFrequency(44100)
                            .outputOptions("-sample_fmt", "s16")
                            .save(outputPath)
                            .on("end", async () => {
                                try {
                                    await fs.rm(inputPath);
                                    await fs.rename(outputPath, inputPath);
                                } catch (err) {
                                    console.log(err);
                                    reject();
                                }
                                resolve();
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

                const allFiles = await recursiveReadDir(
                    `./temp/${req.sessionID}/${folder}`
                );
                const audioFiles = (
                    await Promise.all(
                        allFiles.map(async (file) => {
                            try {
                                const data = await new Promise(
                                    (resolve, reject) => {
                                        new Ffmpeg(file).ffprobe(
                                            (err, data) => {
                                                if (err) {
                                                    return reject("error"); // Reject on error
                                                }
                                                resolve(data);
                                            }
                                        );
                                    }
                                );
                                if (
                                    data.streams[0].codec_type === "audio" &&
                                    data.streams[0].codec_name !== "mp3"
                                ) {
                                    return file;
                                }

                                return null;
                            } catch (err) {
                                return null;
                            }
                        })
                    )
                ).filter((file) => file !== null); // Filter out null values

                console.log(audioFiles);

                let i = 0;
                const threads = process.env.THREADS || 4;
                while (i < audioFiles.length) {
                    const batch = audioFiles.slice(i, i + threads);

                    await Promise.all(
                        batch.map(async (file) => {
                            const inputPath = file;
                            if (inputPath.endsWith(".mp3")) {
                                i++;
                                return;
                            }
                            console.log(file.split("."))
                            const outputPath = file.replace(
                                "." + file.split(".")[file.split(".").length - 1],
                                ".mp3"
                            );
                            console.log(inputPath, outputPath);
                            await new Promise((resolve, reject) => {
                                new Ffmpeg({ source: inputPath })
                                    .audioCodec("libmp3lame")
                                    .audioBitrate(320)
                                    .save(outputPath)
                                    .on("end", () => {
                                        fs.rm(inputPath)
                                            .then(() => {
                                                i++;
                                                status[req.sessionID] = {
                                                    message: `Converting ${folder} to MP3... ${(
                                                        (i /
                                                            audioFiles.length) *
                                                        100
                                                    ).toFixed(2)}% complete`,
                                                };
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
                        })
                    );
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
    }, 100);

    req.on("close", () => {
        clearInterval(statusMessage);
    });
});

fileRouter.get("/getFolderInfo", requireLogin, async (req, res) => {
    const folder = req.query.folder;

    try {
        let { size } = await getFolderSize(`./temp/${req.sessionID}/${folder}`);

        //return either size in mb or gb

        if (size < 1000000000) {
            size = (size / 1000000).toFixed(2) + " MB";
        } else {
            size = (size / 1000000000).toFixed(2) + " GB";
        }

        const files = await recursiveReadDir(
            `./temp/${req.sessionID}/${folder}`
        );

        const audioFiles = [];
        let totDuration = 0;
        let avgBitrate = 0;

        await Promise.all(
            files.map(async (file) => {
                try {
                    const data = await new Promise((resolve, reject) => {
                        new Ffmpeg(file).ffprobe((err, data) => {
                            if (err) {
                                reject("error");
                            }
                            resolve(data);
                        });
                    });
                    if (data.streams[0].codec_type === "audio") {
                        audioFiles.push(file);
                        totDuration += data.format.duration;
                        avgBitrate += data.format.bit_rate;
                    }
                } catch (err) {}
            })
        );

        const duration =
            (totDuration / 60).toFixed(0) + ":" + (totDuration % 60).toFixed(0);

        avgBitrate =
            (avgBitrate / audioFiles.length / 1000).toFixed(0) + " kbps";
        // console.log(audioFiles[0]);
        const probe = await new Promise((resolve, reject) => {
            new Ffmpeg(audioFiles[0]).ffprobe((err, data) => {
                if (err) {
                    // console.log(err)
                    reject(err);
                }
                resolve(data);
            });
        });

        const freq = (probe.streams[0].sample_rate / 1000).toFixed(1) + " kHz";
        const bitsPerSample = probe.streams[0].bits_per_raw_sample + " bits";
        const type = probe.streams[0].codec_name;

        res.json({
            success: true,
            data: {
                albumArtist:
                    probe.format.tags?.album_artist ??
                    probe.streams[0].tags?.album_artist ??
                    "Unknown", //handle edge case for .ogg / .oga files
                folderName: folder,
                size,
                duration,
                avgBitrate,
                frequency: freq,
                bitsPerSample,
                type,
            },
        });
    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: "Failed to get folder info",
            error: err,
        });
    }
});

fileRouter.post("/moveToDirectory", requireLogin, async (req, res) => {
    const { directoryPath } = req.body;
    const { directories } = req.body;

    if (directories === undefined || directories.length === 0) {
        res.json({ success: false, message: "No directories provided" });
        return;
    }
    const config = await ConfigModel.findOne({});

    for (let directory of directories) {
        const outputDirectory = path.join(
            os.homedir(),
            config.mediaFilePath,
            directoryPath,
            directory
        );
        fs.cp(`./temp/${req.sessionID}/${directory}`, outputDirectory, {
            recursive: true,
        })
            .then(() => {
                fs.rm(`./temp/${req.sessionID}/${directory}`, {
                    recursive: true,
                })
                    .then(() => {})
                    .catch((err) => {
                        res.json({
                            success: false,
                            message: "Failed to move files",
                            err,
                        });
                    });
            })
            .catch((err) => {
                res.json({
                    success: false,
                    message: "Failed to move files",
                    err,
                });
            });
    }
    res.json({ success: true, message: "Files moved successfully" });
});

export default fileRouter;
