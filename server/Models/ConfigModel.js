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

    }
);

const Config = mongoose.model("Config", configSchema);

export default Config;