import express from 'express';
import nunjucks from 'nunjucks';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { chatWithContext } from './lib/gptLogger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index.njk');
});

app.post('/submit', async (req, res) => {
    const userMessage = req.body.textInput;

    try {
        const aiResponse = await chatWithContext(userMessage);
        res.json({ result: aiResponse });
    } catch (error) {
        res.status(500).json({ result: "Error processing your request." });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});