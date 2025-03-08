import { Schema } from "mongoose";
import mongoose from "mongoose";

const configSchema = new Schema({
    initialized: {
        type: Boolean,
        default: false,
    },
    mediaFilePath: {
        type: String,
        default: "",
    },
    watchFolderPath: {
        type: String,
        default: "",
    },
    watchFolderLastChecked: {
        type: Date,
        default: new Date(0),
    },
    adminAccountCreated: {
        type: Boolean,
        default: false,
    },
});

const ConfigModel = mongoose.model("Config", configSchema);

export default ConfigModel;
