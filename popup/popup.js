
document.addEventListener("DOMContentLoaded", async () => {

    // // Event listener for the toggleButton to toggle between "Active" and "Inactive" states
    // toggleButton.addEventListener('click', toggleAudioState);

    // // Set the initial state
    // toggleButton.textContent = 'Deactivate';
    // audioElement.setAttribute('controls', 'true'); // By default, make the audio tag clickable
});


// Function to handle the state of the toggleButton
function toggleAudioState() {
    const currentState = toggleButton.textContent;
    // deactivate state. remove transeloes submit button
    if (currentState === 'Deactivate') {
        // Switch to "Inactive" state and make the audio tag unclickable
        toggleButton.textContent = 'Activate';
        audioElement.removeAttribute('controls');
    } else {
        // Switch to "Active" state and make the audio tag clickable
        toggleButton.textContent = 'Deactivate';
        audioElement.setAttribute('controls', 'true');
    }
}