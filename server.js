// server.js
import express from 'express';
import nunjucks from 'nunjucks';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { chatWithContext } from './openai.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Status Updates Route
app.get('/status', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendStatusUpdate = (message) => {
        res.write(`data: ${JSON.stringify({ message })}\n\n`);
    };

    let intervalId = setInterval(() => sendStatusUpdate("Still processing..."), 2000);

    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });

    sendStatusUpdate("Preparing your request...");
});

// Root Route
app.get('/', (req, res) => {
    res.render('index.njk');
});

// Submit Chat Route
app.post('/submit', async (req, res) => {
    const userMessage = req.body.textInput;

    try {
        const aiResponse = await chatWithContext(userMessage);
        res.json({ result: aiResponse });
    } catch (error) {
        res.status(500).json({ result: "Error processing your request." });
    }
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
