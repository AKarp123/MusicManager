import { Router } from "express";
import passport from "passport";
import ConfigModel from "../Models/ConfigModel.js";
import UserModel from "../Models/UserModel.js";
import fileRouter from "./FileRouter.js";
import requireLogin from "../requireLogin.js";
import axios from "axios";
import configRouter from "./Config.js";
import UserRouter from "./UserRoutes.js";
import { setTimeout } from "node:timers/promises"

const router = Router();

export const sessionDirectories = {};

//temp
router.post("/login", passport.authenticate("local"), async (req, res) => {
    if (req.user) {
        const config = await ConfigModel.findOne({});
        res.json({
            success: true,
            message: "You have been successfully logged in",
            user: req.user,
            config: config,
        });
    } else {
        res.json({ success: false, message: "Failed to log in" });
    }
});

router.post("/logout", (req, res) => {
    req.logout((err) => console.log(err));
});

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const config = await ConfigModel.findOne({});

    const user = await UserModel.findOne({ username: req.user });
    if (user && user.role === "admin") {
        //if an admin wants to create a new user account (not implemented yet)
        UserModel.register(
            new UserModel({ username: username, role: "user" }),
            password,
            (err, user) => {
                if (err) {
                    console.log(err);
                    res.json({ success: false, message: "Failed to register" });
                    return;
                }
                console.log("Config created");
                config.save().then(() => {
                    console.log("Config saved");
                });
            }
        );
        res.json({
            success: true,
            message: "You have been successfully registered",
            user: user,
            config: config,
        });
        return;
    }

    if (config.initialized || config.adminAccountCreated) {
        //if everything is configured do not allow a random user to register
        res.json({ success: false, message: "Registration is closed" });
        return;
    }

    UserModel.register(
        new UserModel({ username: username, role: "admin" }),
        password,
        (err, user) => {
            if (err) {
                console.log(err);
                res.json({ success: false, message: "Failed to register" });
                return;
            }
            console.log("Config created");
            config.adminAccountCreated = true;
            config.save().then(() => {
                console.log("Config saved");
            });

            res.json({
                success: true,
                message: "You have been successfully registered",
                user: user,
                config: config,
            });
        }
    );
});


router.get("/getUserData", async (req, res) => {
    let config = await ConfigModel.findOne({});
    if (!config.initialized && !config.adminAccountCreated) {
        res.json({
            success: false,
            messsage: "Complete Configuration",
            user: "Complete Configuration",
        });
        return;
    }

    if (!req.user) {
        res.json({
            success: false,
            message: "You must be logged in to access this resource",
            user: null,
        });
        return;
    }

    if (req.user) {
        const config = await ConfigModel.findOne({});
        res.json({ success: true, user: req.user, config: config });
    } else {
        res.json({
            success: false,
            message: "You must be logged in to access this resource",
            user: null,
        });
    }
});

router.get("/scan", requireLogin, async (req, res) => {
    if(process.env.ND_ENABLE !== "true") {
        res.json({ success: false, message: "Navidrome integration is disabled" });
        return;
    }
    let baseUrl = process.env.ND_BASE_URL+"/rest/startScan";
    let target = [];
    const targets = (Array.from(sessionDirectories[req.sessionID].directories)).map((dir) => `1:${dir}`);

    const query = {
        target: targets,
        c: "MusicManager",
        u: process.env.ND_USERNAME,
        p: process.env.ND_PASSWORD,
        v: "1.16.0",
    }
    console.log(axios.getUri({ url: baseUrl, params: query, paramsSerializer: { indexes: null} }));
    await setTimeout(7000);
    await axios.get(baseUrl, { params: query, paramsSerializer: { indexes: null} });
    res.json({ success: true });
    delete sessionDirectories[req.sessionID];       
});




router.use("/", fileRouter);
router.use("/config", requireLogin, configRouter);
router.use("/user", requireLogin, UserRouter);

export default router;
