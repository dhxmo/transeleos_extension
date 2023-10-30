import { getCurrentTab, showNotification } from "../scripts/utils.js";

// document.addEventListener("DOMContentLoaded", function () {
const audioInfo = document.getElementById("audio-info");
const audioFileName = document.getElementById("translated-file-name");
const audioElement = document.getElementById("translated-audio");
const toggleButton = document.getElementById("toggle-audio");

document.addEventListener("DOMContentLoaded", async () => {
    const currentTab = await getCurrentTab();

    const currentUrl = currentTab.url;

    const queryParameters = currentUrl.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    const container = document.getElementsByClassName("container")[0];

    // if audio exists, will wrap here

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
        toggleButton.addEventListener("click", function () {
            // Call a function to load and play the audio
            loadAndPlayAudio();
        });
    } else {
        // Not a YouTube video
        container.innerHTML = '<div class="title">transeleos only works on youtube videos</div>';
    }
});

// Function to load and play the audio
function loadAndPlayAudio() {
    const s3AudioURL = "https://giffe.s3.ap-south-1.amazonaws.com/translated_audio/tomp3.cc+-+PM+Modi+Speech+%E0%A4%AA%E0%A4%8F%E0%A4%AE+%E0%A4%AE%E0%A4%A6+%E0%A4%A8+%E0%A4%85%E0%A4%AA%E0%A4%A8+%E0%A4%A4%E0%A4%B8%E0%A4%B0+%E0%A4%9F%E0%A4%B0%E0%A4%AE+%E0%A4%95+%E0%A4%90%E0%A4%B2%E0%A4%A8+%E0%A4%95%E0%A4%B0+%E0%A4%A6%E0%A4%AF+NDA+INIDIA+Hindi+News_320kbps.mp3";

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
            } else {
                showNotification('Invalid or empty blob received', true);
            }
        })
        .catch((error) => {
            showNotification(`Error fetching and playing audio:, ${error}`, true);
        });
}


// TODO: make fetch request to translate

// TODO: add active/inactive button

// TODO: fetch audio and find a way to stream.

// IF active button turned on -> audio playing, mute youtube sound
// IF active button turned off -> yt audio playing. mute audio stream

