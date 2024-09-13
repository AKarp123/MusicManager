import express from "express";
import router from "./routes/index.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { join } from "path";
import session from "express-session";
import passport from "passport";
import UserModel from "./Models/UserModel.js";
import MongoStore from "connect-mongo";
import initializeConfig from "./initializeConfig.js";
import reset from "./reset.js";

const app = express();
const port = 3000;

mongoose.connect(
    process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI
        : process.env.MONGODB_DEV_URI
);
const db = mongoose.connection;

const __dirname = new URL(".", import.meta.url).pathname;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(join(__dirname, "../client/public")));
app.use(express.static(join(__dirname, "../client/dist")));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
        store: MongoStore.create({
            mongoUrl:
                process.env.NODE_ENV === "production"
                    ? process.env.MONGODB_URI
                    : process.env.MONGODB_DEV_URI,
        }),
    })
);


//passport configuration
app.use(passport.session());
app.use(passport.initialize());
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

app.use("/api", router);
app.use("*", (req, res) => {
    res.sendFile(join(__dirname, "../client/dist/index.html"));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

db.on("error", (err) => {
    console.log("Error occurred from the database ", err);
});

db.once("open", async () => {
    console.log("Connected to MongoDB");
    // await initializeConfig();
    // reset();

  
});


export {db};
