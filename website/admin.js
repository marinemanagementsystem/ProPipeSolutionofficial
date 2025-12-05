document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('socialLinksForm');
    const statusDiv = document.getElementById('status');
    const jsonDataPre = document.getElementById('jsonData');
    const jsonFilePath = 'social_links.json';

    // --- Load initial data ---
    async function loadLinks() {
        try {
            const response = await fetch(`${jsonFilePath}?t=${Date.now()}`); // Prevent caching
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            populateForm(data);
            displayJsonData(data);
        } catch (error) {
            console.error('Error loading links:', error);
            statusDiv.textContent = `Error loading links: ${error.message}. Using default values.`;
            statusDiv.style.color = 'red';
            // Populate with defaults if loading fails
            const defaultData = {
              linkedin: "", whatsapp: "", twitter: "", instagram: "", telegram: ""
            };
            populateForm(defaultData);
            displayJsonData(defaultData);
        }
    }

    // --- Populate form fields ---
    function populateForm(data) {
        for (const key in data) {
            if (form.elements[key]) {
                form.elements[key].value = data[key];
            }
        }
    }

    // --- Display current JSON data ---
    function displayJsonData(data) {
        jsonDataPre.textContent = JSON.stringify(data, null, 2); // Pretty print JSON
    }

    // --- Save data (Attempt to PUT to JSON file) ---
    async function saveLinks(data) {
        statusDiv.textContent = 'Saving...';
        statusDiv.style.color = 'orange';
        try {
            // IMPORTANT: This fetch PUT request will likely fail on most standard web servers
            // unless specifically configured, which is generally insecure.
            // This demonstrates the concept but is not a production-ready save mechanism.
            const response = await fetch(jsonFilePath, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data, null, 2), // Send pretty-printed JSON
            });

            if (!response.ok) {
                 // Provide more specific feedback if possible
                 let errorMsg = `HTTP error! status: ${response.status}`;
                 try {
                     const errorBody = await response.text();
                     errorMsg += ` - ${errorBody}`;
                 } catch { /* Ignore if error body can't be read */ }
                throw new Error(errorMsg);
            }

            // If PUT seemed successful (status 2xx)
            statusDiv.textContent = 'Links saved successfully! (Note: Server confirmation may vary)';
            statusDiv.style.color = 'green';
            displayJsonData(data); // Update displayed JSON
            console.log('Data theoretically saved:', data);

        } catch (error) {
            console.error('Error saving links:', error);
            statusDiv.textContent = `Error saving links: ${error.message}. See console for details. Changes might not be saved.`;
            statusDiv.style.color = 'red';
             // Still display the data that *should* have been saved
             displayJsonData(data);
        }
    }

    // --- Form submission handler ---
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        const formData = new FormData(form);
        const updatedData = {};
        for (const [key, value] of formData.entries()) {
            updatedData[key] = value;
        }
        saveLinks(updatedData);
    });

    // --- Initial load ---
    loadLinks();
}); 