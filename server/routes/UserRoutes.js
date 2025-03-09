import { Router } from "express";
import UserModel from "../Models/UserModel.js";


const UserRouter = Router();


UserRouter.patch("/password", async (req, res) => {
    const user = await UserModel.findOne({ username: req.user.username });
    user.setPassword(req.body.password, async () => {
        await user.save();
        res.json({ success: true, message: "Password updated" });
    });
})




export default UserRouter;