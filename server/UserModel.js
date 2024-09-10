import { Schema }from "mongoose";
import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new Schema({});

UserSchema.plugin(passportLocalMongoose);

const userModel = new mongoose.model("User", UserSchema);

export default userModel;