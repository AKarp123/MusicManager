import { db } from "./app.js";
import initializeConfig from "./initializeConfig.js";



const reset = async () => { 

    db.dropDatabase();
    await initializeConfig();
    console.log("Reset complete");
}

export default reset;
