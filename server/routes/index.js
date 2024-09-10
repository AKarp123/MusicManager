import { Router } from "express";


const router = Router();

//temp
router.get("/getUser", (req, res) => {

    res.json({
        success: true,
        // user: {
        //     name: "Kawambiit"
        // }
        user: null
    })

})

export default router;