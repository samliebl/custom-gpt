import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Function to create daily log file and append chat
function appendToDailyLog(userMessage, aiReply) {
    const today = new Date().toISOString().split('T')[0];
    const logDir = path.join(process.cwd(), 'log');
    const logFile = path.join(logDir, `${today}.txt`);

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    const logContent = `User: ${userMessage}\nAI: ${aiReply}\n\n`;
    fs.appendFileSync(logFile, logContent, 'utf8');
    console.log(`Chat appended to ${logFile}`);
}

// Function to send a message and log the conversation
async function chatWithGPT(userMessage) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }]
        });

        const aiReply = response.choices[0].message.content;
        console.log("AI Response:", aiReply);

        appendToDailyLog(userMessage, aiReply);
    } catch (error) {
        console.error("Error communicating with OpenAI:", error.message);
    }
}

// Example usage
const userMessage = "Explain the importance of water in life.";
chatWithGPT(userMessage);