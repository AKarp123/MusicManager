import express from 'express';
import router from './routes/index.js';

const app = express();
const port = 3000;

app.use("/api", router);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
});