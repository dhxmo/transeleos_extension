import { getCurrentTab, showNotification } from "../scripts/utils.js";

// document.addEventListener("DOMContentLoaded", function () {
const submitButton = document.getElementById("submit");
const audioInfo = document.getElementById("audio-info");
const audioElement = document.getElementById("translated-audio");
const toggleButton = document.getElementById("toggle-audio");

document.addEventListener("DOMContentLoaded", async () => {
    const currentTab = await getCurrentTab();
    console.log("currentTab: ", currentTab);

    const currentUrl = currentTab.url;

    const queryParameters = currentUrl.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    const container = document.getElementsByClassName("container")[0];

    if (currentTab.url.includes("youtube.com/watch") && currentVideo) {
        const url = `https://transeleos.com/get_video_duration?url=${currentUrl}`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                const match = data.video_duration.match(/PT(\d+)M(\d+)S/);

                if (match) {
                    const minutes = parseInt(match[1]);

                    if (minutes > 10) {
                        container.innerHTML = '<div class="title">transeleos only works on youtube videos under 10 minutes</div>';
                    }
                }
            })
            .catch((error) => {
                showNotification(`Error fetching video duration: ${error}`, true);
            });

        // Add a click event listener to the button
        submitButton.addEventListener("click", function () {
            // server send and then store audio to local


            // Call a function to load and play the audio
            loadAndPlayAudio();

            // show audio div
            audioInfo.style.display = "block";
            // Set the initial state
            toggleButton.textContent = 'Deactivate';
            audioElement.setAttribute('controls', 'true'); // By default, make the audio tag clickable


        });
    } else {
        // Not a YouTube video
        container.innerHTML = '<div class="title">transeleos only works on youtube videos</div>';
    }


    // toggleButton.addEventListener("click", function () {
    // Get the audio state from local storage
    // chrome.storage.local.get('audioState', (result) => {
    //     const audioState = result.audioState;
    //     if (audioState) {
    //         console.log('Retrieved audio state:', audioState);

    //         // Set the audio element's current time
    //         audioElement.currentTime = audioState.currentTime;
    //         if (audioState.playing) {
    //             // Play the audio if it was playing when the popup was closed
    //             audioElement.play();
    //             console.log('Resuming audio playback.');
    //         } else {
    //             console.log('Audio is not set to play.');
    //         }
    //     } else {
    //         console.log('No audio state found in local storage.');

    //     }
    // });
    // });

    // Add event listeners for play and pause events
    audioElement.addEventListener('play', handleAudioStateChange);
    audioElement.addEventListener('pause', handleAudioStateChange);

    // Event listener for the toggleButton to toggle between "Active" and "Inactive" states
    toggleButton.addEventListener('click', toggleAudioState);

    // Set the initial state
    toggleButton.textContent = 'Deactivate';
    audioElement.setAttribute('controls', 'true'); // By default, make the audio tag clickable
});

// Function to load and play the audio
function loadAndPlayAudio() {
    const s3AudioURL = "https://giffe.s3.ap-south-1.amazonaws.com/translated_audio/9+minutes+of+Relatable+TikToks.mp3";

    fetch(s3AudioURL, { mode: 'no-cors' })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then((blob) => {
            if (blob instanceof Blob) {
                const audioURL = URL.createObjectURL(blob);
                audioElement.src = audioURL; // Set the source

                // Save the audio state in local storage
                const audioState = {
                    currentTime: audioElement.currentTime,
                    playing: true, // Default to not playing
                };
                console.log('Storing audio state:', audioState);
                chrome.storage.local.set({ audioState });

                audioElement.play(); // Play the audio
                console.log('Playing the audio.');
            } else {
                showNotification('Invalid or empty blob received', true);
            }
        })
        .catch((error) => {
            showNotification(`Error fetching and playing audio:, ${error}`, true);
        });
}

// Function to handle play and pause events
function handleAudioStateChange() {
    const audioState = {
        currentTime: audioElement.currentTime,
        playing: !audioElement.paused, // Check if audio is playing
    };
    console.log('Storing audio state:', audioState);
    chrome.storage.local.set({ audioState });
}

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

// TODO: make fetch request to translate

// IF active button turned on -> audio playing, mute youtube sound
// IF active button turned off -> yt audio playing. mute audio stream
