import { Router } from 'express';
import ConfigModel from '../Models/ConfigModel.js';

const configRouter = Router();




configRouter.get("/", async (req, res) => {
    const config = await ConfigModel.findOne({});
    res.json({ success: true, config: config });
});

configRouter.patch("/mediafilepath", async (req, res) => {
    const config = await ConfigModel.findOne({});
    config.mediaFilePath = req.body.mediaFilePath;
    fs.access(path.join(os.homedir(), config.mediaFilePath))
        .then(() => {
            return config.save();
        })
        .then(() => {
            res.json({ success: true, message: "Media file path updated" });
        })
        .catch(() => {
            res.json({ success: false, message: "Invalid path" });
        });
});

configRouter.patch("/watchfolderpath", async (req, res) => {
    const config = await ConfigModel.findOne({});
    config.watchFolderPath = req.body.watchFolderPath;
    config.watchFolderLastChecked = new Date(0);
    fs.access(path.join(os.homedir(), config.watchFolderPath))
        .then(() => {
            return config.save();
        })
        .then(() => {
            res.json({ success: true, message: "Watch folder path updated" });
        })
        .catch(() => {
            res.json({ success: false, message: "Invalid path" });
        });
});

configRouter.patch("/watchfolderlastchecked", async (req, res) => { 
    const config = await ConfigModel.findOne({});
    config.watchFolderLastChecked = new Date();
    config.save().then(() => {
        res.json({ success: true, message: "Watch folder last checked updated" });
    });
});











export default configRouter;