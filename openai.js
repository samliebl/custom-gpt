// openai.js
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

// Paths for logs and history
const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'chat_history.json');
const LOG_DIR = path.join(process.cwd(), 'log');

// Ensure directories and files exist
function initializeFiles() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, '[]', 'utf8');
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
}

// Read chat history
function readHistory() {
    initializeFiles();
    const fileContent = fs.readFileSync(HISTORY_FILE, 'utf8');
    return JSON.parse(fileContent);
}

// Append to chat history
function appendToHistory(role, content) {
    const history = readHistory();
    history.push({ role, content, timestamp: new Date().toISOString() });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

// Function to create daily log file and append chat
function appendToDailyLog(userMessage, aiReply) {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${today}.txt`);

    const logContent = `User: ${userMessage}\nAI: ${aiReply}\n\n`;
    fs.appendFileSync(logFile, logContent, 'utf8');
    console.log(`Chat appended to ${logFile}`);
}

// Function to interact with OpenAI and maintain context
export async function chatWithContext(userMessage) {
    try {
        initializeFiles();

        const conversationHistory = readHistory();
        const limitedHistory = conversationHistory.slice(-10); // Keep last 10 interactions
        limitedHistory.push({ role: "user", content: userMessage });

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: limitedHistory
        });

        const aiReply = response.choices[0].message.content;
        appendToHistory("user", userMessage);
        appendToHistory("assistant", aiReply);
        appendToDailyLog(userMessage, aiReply);

        return aiReply;
    } catch (error) {
        console.error("Error communicating with OpenAI:", error.message);
        throw new Error("An error occurred while processing your request.");
    }
}
