import multer from "multer";
import fs from "node:fs/promises";



const destination = multer.diskStorage({
    destination: (req, file, cb) => {
        const album = req.body.relativePaths;
   
      
       
        if(album){
            fs.mkdir(`./temp/${req.sessionID}/${album}`, { recursive: true })
            .then(() => {
                cb(null, `./temp/${req.sessionID}/${album}`);
            })
            
        }
        else {
            fs.mkdirSync(`./temp/${req.sessionID}`, { recursive: true });
            cb(null, `./temp/${req.sessionID}`);
        }
    
    },
    filename: (req, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: destination });


export { upload }