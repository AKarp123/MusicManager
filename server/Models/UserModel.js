import { Schema }from "mongoose";
import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new Schema({
    role: { type: String, default: "user", enum: ["user", "admin"] },
});

UserSchema.plugin(passportLocalMongoose);

const userModel = new mongoose.model("User", UserSchema);

export default userModel;