import { getCurrentTab, showNotification } from "../scripts/utils.js";


const container = document.getElementsByClassName("container")[0];
const submitButton = document.getElementById("submit");
const audioInfo = document.getElementById("audio-info");
const audioElement = document.getElementById("translated-audio");
const toggleButton = document.getElementById("toggle-audio");

let fetchMade = false; // Local state variable to track if a fetch has been made
let audioTimestamp = 0;


document.addEventListener("DOMContentLoaded", async () => {
    const currentTab = await getCurrentTab();
    const currentUrl = currentTab.url;
    const queryParameters = currentUrl.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get("v");

    if (currentTab.url.includes("youtube.com/watch") && currentVideo) {
        await fetchVideoDuration(currentUrl);

        // if valid youtube video, add a click event listener to the button
        submitButton.addEventListener("click", async function () {
            // server send and then store audio to local
            // const s3url = server_fetch()
            // loadAndPlayAudio(s3url);

            // Call a function to load and play the audio
            await loadAndPlayAudio();

            displayAudioInfo();
        });
    } else {
        // Not a YouTube video
        container.innerHTML = '<div class="title">transeleos only works on youtube videos</div>';
    }


    // When loading the popup, retrieve audio state from local storage
    chrome.storage.local.get('audioState', (result) => {
        const audioState = result.audioState;

        // if transeleoed video already
        if (audioState.fetchMade) {
            displayAudioInfo();

            fetch(audioState.url, { mode: 'no-cors' })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.blob();
                })
                .then((blob) => {
                    if (blob instanceof Blob) {
                        // Set the audio element's source
                        const audioURL = URL.createObjectURL(blob);
                        audioElement.src = audioURL;
                        audioElement.currentTime = audioState.audioTimestamp; // Jump to the stored timestamp
                    } else {
                        showNotification('Invalid or empty blob received', true);
                    }
                })
                .catch((error) => {
                    showNotification(`Error fetching audio: ${error}`, true);
                });
        }
    });



    // Add event listeners for play and pause events
    audioElement.addEventListener('play', handleAudioStateChange);
    audioElement.addEventListener('pause', handleAudioStateChange);

    // Event listener for the toggleButton to toggle between "Active" and "Inactive" states
    toggleButton.addEventListener('click', toggleAudioState);

    // Set the initial state
    toggleButton.textContent = 'Deactivate';
    audioElement.setAttribute('controls', 'true'); // By default, make the audio tag clickable
});


function displayAudioInfo() {
    // show audio div
    audioInfo.style.display = "block";
    // Set the initial state
    toggleButton.textContent = 'Deactivate';
    audioElement.setAttribute('controls', 'true'); // By default, make the audio tag clickable
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


const fetchVideoDuration = async (currentUrl) => {
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
}

// Function to load and play the audio
// function loadAndPlayAudio(s3AudioURL) {
const loadAndPlayAudio = async () => {
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
                audioElement.play(); // Play the audio
                console.log('Playing the audio.');

                // Set the local state variables
                const audioState = {
                    url: s3AudioURL,
                    fetchMade: true,
                    audioTimestamp: audioElement.currentTime
                }
                console.log('Storing audio state:', audioState);
                chrome.storage.local.set({ audioState });

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
    let localAudioState;

    chrome.storage.local.get('audioState', (result) => {
        localAudioState = result.audioState;

        if (localAudioState) {
            const audioState = {
                url: localAudioState.url,
                fetchMade: localAudioState.fetchMade,
                audioTimestamp: audioElement.currentTime
            };
            console.log('if Storing updated  audio state:', audioState);
            chrome.storage.local.set({ audioState });
        } else {
            console.log('else Storing updated audio state:', localAudioState);
            chrome.storage.local.set({ localAudioState });
        }
    });


}

// TODO: make fetch request to translate

// IF active button turned on -> audio playing, mute youtube sound
// IF active button turned off -> yt audio playing. mute audio stream
