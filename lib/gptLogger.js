import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Paths for logs
const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'chat_history.json');
const LOG_DIR = path.join(process.cwd(), 'log');

// Ensure directories and files exist
function initializeFiles() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, '[]', 'utf8');
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
}

// Read JSON history
function readHistory() {
    initializeFiles();
    const fileContent = fs.readFileSync(HISTORY_FILE, 'utf8');
    return JSON.parse(fileContent);
}

// Append to JSON history
function appendToHistory(role, content) {
    const history = readHistory();
    history.push({ role, content, timestamp: new Date().toISOString() });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

// Append to daily log
function appendToDailyLog(userMessage, aiReply) {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${today}.txt`);

    const logContent = `User: ${userMessage}\nAI: ${aiReply}\n\n`;
    fs.appendFileSync(logFile, logContent, 'utf8');
    console.log(`Chat appended to ${logFile}`);
}

// Main function to interact with OpenAI and log responses
export async function chatWithContext(userMessage) {
    try {
        initializeFiles();
        const conversationHistory = readHistory();

        // Add user message for context
        conversationHistory.push({ role: "user", content: userMessage });

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: conversationHistory
        });

        const aiReply = response.choices[0].message.content;

        // console.log("AI Response:", aiReply);

        // Append to both logs simultaneously
        appendToHistory("user", userMessage);
        appendToHistory("assistant", aiReply);
        appendToDailyLog(userMessage, aiReply);

        return aiReply;
    } catch (error) {
        const errorMessage = `Error: ${error.response?.data?.error?.message || error.message}`;
        console.error("An error occurred:", errorMessage);

        // Log error to both logs
        appendToHistory("system", errorMessage);
        appendToDailyLog("Error occurred while processing user input", errorMessage);

        throw new Error("An unexpected error occurred. Please try again.");
    }
}