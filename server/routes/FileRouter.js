import { Router } from "express";
import requireLogin from "../requireLogin.js";
import ConfigModel from "../Models/ConfigModel.js";
import fs from "fs";
import path from "path";
import os from "os";

const fileRouter = Router();

fileRouter.get("/listDirectories", requireLogin, async (req, res) => {
    const config = await ConfigModel.findOne({});

    const { directory } = req.query;

    if (config.mediaFilePath !== "") {
        let userDirectory = path.join(os.homedir(), config.mediaFilePath, directory ? directory : ""); //media server path + subdirectory
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

export default fileRouter;
