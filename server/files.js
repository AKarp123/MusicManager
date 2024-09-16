import multer from "multer";
import fs from "fs";



const destination = multer.diskStorage({
    destination: (req, file, cb) => {
        const album = req.body.relativePaths;
        console.log(req.body)
      
       
        if(album){
            fs.mkdirSync(`./temp/${req.sessionID}/${album}`, { recursive: true });
            cb(null, `./temp/${req.sessionID}/${album}`);
        }
        else {
            fs.mkdirSync(`./temp/${req.sessionID}`, { recursive: true });
            cb(null, `./temp/${req.sessionID}`);
        }
    
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: destination });


export { upload }