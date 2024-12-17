document.getElementById('textForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const input = document.getElementById('textInput').value;

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ textInput: input })
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('response').innerText = data.result;
        } else {
            document.getElementById('response').innerText = 'Error submitting data.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An unexpected error occurred.';
    }
});