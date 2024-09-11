import { Router } from "express";
import passport from "passport";
import Config from "../Models/ConfigModel.js";


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

//logout passport
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if(err){
            return res.json({sucess: false, message: "Failed to log out"});
        }
    });
    res.json({sucess: true, message: "You have been successfully logged out"});
});

router.get('/getUserData', (req, res) => {
    
    
    if(req.user){
        res.json({sucess: true, user: req.user});
    }
    else{
        res.json({sucess: false, message: "You must be logged in to access this resource", user: null});   
    }
});

export default router;