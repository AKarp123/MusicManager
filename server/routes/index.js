import { Router } from "express";
import passport from "passport";
import ConfigModel from "../Models/ConfigModel.js";
import UserModel from "../Models/UserModel.js";



const router = Router();

//temp
router.post('/login', passport.authenticate('local'), (req, res) => {
    if(req.user){
        res.json({sucess: true, message: "You have been successfully logged in"});
    }
    else{
        res.json({sucess: false, message: "Failed to log in"});
    }
});

router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    const config = await ConfigModel.findOne({});
    if(config.initialized){
        res.json({sucess: false, message: "Registration is closed"});
        return;
    }
    UserModel.register(new UserModel({username: username, role: "admin"}), password, (err, user) => {
        if(err){
            console.log(err);
            res.json({sucess: false, message: "Failed to register"});
            return;
        }
        console.log("Config created");
        config.initialized = true;
        config.save()
        .then(() => {
            console.log("Config saved");
        })

        
        
        res.json({sucess: true, message: "You have been successfully registered", user: user});

    });

})

//logout passport
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if(err){
            return res.json({sucess: false, message: "Failed to log out"});
        }
    });
    res.json({sucess: true, message: "You have been successfully logged out"});
});

router.get('/getUserData', async (req, res) => {
    let config = await ConfigModel.findOne({});
    if(!config.initialized) {
        res.json({
            success: false,
            messsage: "Complete Configuration",
            user: "Complete Configuration"
        })
        return;
    }
    
    if(req.user){
        res.json({sucess: true, user: req.user});
    }
    else{
        res.json({sucess: false, message: "You must be logged in to access this resource", user: null});   
    }
});

export default router;