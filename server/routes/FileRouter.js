import { Router } from "express";
import requireLogin from "../requireLogin.js";
import ConfigModel from "../Models/ConfigModel.js";
import fs from "fs";
import path from "path";
import os from "os";
import { upload } from "../files.js";

const fileRouter = Router();

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
            const directoryName = req.body.relativePaths
                ? req.body.relativePaths[0].split("/")[0]
                : null;

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

export default fileRouter;
