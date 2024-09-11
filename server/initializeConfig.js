import ConfigModel from './Models/ConfigModel.js';


const initializeConfig = async () => {

    const config = await ConfigModel.findOne({});

    if (!config) {
        const newConfig = new ConfigModel({});
        await newConfig.save();
        console.log("Config initialized");
    }
}

export default initializeConfig;