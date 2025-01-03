document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("textForm");
    const textInput = document.getElementById("textInput");
    const responseDiv = document.getElementById("response");
    const chatLog = document.getElementById("chat-log"); // Ensure this is inside DOMContentLoaded

    let tickerInterval;
    let tickerMessage = "Still processing";
    let dotCount = 0;

    const startTicker = () => {
        tickerInterval = setInterval(() => {
            dotCount = (dotCount + 1) % 4;
            responseDiv.textContent = `${tickerMessage}${".".repeat(dotCount)}`;
        }, 500);
    };

    const stopTicker = () => {
        clearInterval(tickerInterval);
        dotCount = 0;
    };

    const formatResponse = (responseText) => {
        return responseText.replace(/\n\n/g, "<br><br>");
    };

    const addChatEntry = (prompt, response) => {
        const timestamp = new Date().toISOString().split("T")[0];
        const promptSnippet = prompt.split(" ").slice(0, 5).join(" ") + "…";
        const responseSnippet = response.split(" ").slice(0, 5).join(" ") + "…";

        const entryTitle = `${promptSnippet} ${timestamp} ${responseSnippet}`;

        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = entryTitle;

        const contentDiv = document.createElement("div");
        contentDiv.innerHTML = `
            <p><strong>Prompt:</strong> ${prompt}</p>
            <p><strong>Response:</strong> ${response}</p>
            <button class="copy-btn" onclick="copyToClipboard('${response}')">Copy Response</button>
        `;

        details.appendChild(summary);
        details.appendChild(contentDiv);

        chatLog.appendChild(details);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Response copied to clipboard!");
        }).catch((err) => {
            console.error("Failed to copy text:", err);
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        responseDiv.innerHTML = "";
        startTicker();

        const userMessage = textInput.value;

        try {
            const response = await fetch("/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ textInput: userMessage }),
            });

            const data = await response.json();
            stopTicker();
            responseDiv.innerHTML = formatResponse(data.result);

            addChatEntry(userMessage, data.result); // Add chat entry to the log
        } catch (error) {
            stopTicker();
            responseDiv.textContent = "An error occurred. Please try again.";
            console.error("Error:", error);
        }
    };

    form.addEventListener("submit", handleFormSubmit);
});
