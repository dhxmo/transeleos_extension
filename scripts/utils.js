// https://developer.chrome.com/docs/extensions/reference/tabs/
export async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// Function to show a notification message
export function showNotification(message, isError = true) {
    const notificationDiv = document.getElementById("notification");

    // Set the notification message and style
    notificationDiv.textContent = message;
    notificationDiv.style.display = "block";

    // Set the notification style based on the error status
    if (isError) {
        notificationDiv.style.backgroundColor = "red"; // You can customize the error notification style
    }

    // Hide the notification after a few seconds (adjust the timeout as needed)
    setTimeout(() => {
        notificationDiv.style.display = "none";
    }, 5000);
}