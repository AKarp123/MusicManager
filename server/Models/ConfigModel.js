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
    adminAccountCreated: {
        type: Boolean,
        default: false,
    }

    }
);

const ConfigModel = mongoose.model("Config", configSchema);

export default ConfigModel;