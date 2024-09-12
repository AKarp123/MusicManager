import { db } from "./app";
import initializeConfig from "./initializeConfig";



const reset = async () => { 

    db.dropDatabase();
    await initializeConfig();
    console.log("Reset complete");
}
