import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Paths for logs and history
const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'chat_history.json');
const LOG_DIR = path.join(process.cwd(), 'log');

function initializeFiles() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, '[]', 'utf8');
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
}

function readHistory() {
    initializeFiles();
    const fileContent = fs.readFileSync(HISTORY_FILE, 'utf8');
    return JSON.parse(fileContent);
}

function appendToHistory(role, content) {
    const history = readHistory();
    history.push({ role, content, timestamp: new Date().toISOString() });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

function appendToDailyLog(userMessage, aiReply) {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${today}.txt`);
    const logContent = `User: ${userMessage}\nAI: ${aiReply}\n\n`;
    fs.appendFileSync(logFile, logContent, 'utf8');
}

export async function chatWithContext(userMessage) {
    try {
        initializeFiles();

        const basePrompt = `
        Respond in plain text only. Do not use any formatting or styling. You may use newlines to break up information. You can use numbered and or ordered lists but use "- " for unordered. No special bullets. Avoid any conversational tone. Use concise and factual statements without softeners like "I think" or "perhaps." Example:

        Prompt: What is the capital of France?
        Response: Paris.

        Prompt: Explain quantum entanglement.
        Response: A phenomenon where two or more particles become interconnected, such that the state of one particle instantly influences the state of another, regardless of distance.
        `;

        const conversationHistory = readHistory();
        const limitedHistory = conversationHistory.slice(-10); // Keep last 10 interactions

        // Combine the base prompt with the user's message
        const fullPrompt = `${basePrompt}\nPrompt: ${userMessage}\nResponse:`;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: fullPrompt }],
        });

        const aiReply = response.choices[0].message.content.trim();

        appendToHistory("user", userMessage);
        appendToHistory("assistant", aiReply);
        appendToDailyLog(userMessage, aiReply);

        return aiReply;
    } catch (error) {
        console.error("Error communicating with OpenAI:", error.message);
        throw new Error("An error occurred while processing your request.");
    }
}
