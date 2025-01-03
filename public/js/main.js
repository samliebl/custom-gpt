document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("textForm");
    const textInput = document.getElementById("textInput");
    const responseDiv = document.getElementById("response");

    let tickerInterval; // To track the interval
    let tickerMessage = "Still processing";
    let dotCount = 0; // To track the number of dots

    // Function to start the ticker
    const startTicker = () => {
        tickerInterval = setInterval(() => {
            dotCount = (dotCount + 1) % 4; // Cycle through 0, 1, 2, 3
            responseDiv.textContent = `${tickerMessage}${".".repeat(dotCount)}`;
        }, 500); // Update every 500ms
    };

    // Function to stop the ticker
    const stopTicker = () => {
        clearInterval(tickerInterval);
        dotCount = 0; // Reset dots
    };

    // Helper function to format newlines for HTML
    const formatResponse = (responseText) => {
        return responseText.replace(/\n\n/g, "<br><br>");
    };

    // Form submission handler
    const handleFormSubmit = async (event) => {
        event.preventDefault();

        responseDiv.innerHTML = ""; // Clear any previous responses
        startTicker(); // Start showing the ellipses ticker

        const userMessage = textInput.value;

        try {
            const response = await fetch("/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ textInput: userMessage }),
            });

            const data = await response.json();
            stopTicker(); // Stop the ticker once response is received

            // Display the formatted response
            responseDiv.innerHTML = formatResponse(data.result);
        } catch (error) {
            stopTicker(); // Stop ticker on error
            responseDiv.textContent = "An error occurred. Please try again.";
            console.error("Error:", error);
        }
    };

    form.addEventListener("submit", handleFormSubmit);
});
