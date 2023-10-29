import { getCurrentTab, showNotification } from "../scripts/utils.js";

// Initialize a variable to keep track of the button state
// let isAudioActive = true; // Set to true by default
// let isVideoLengthOk = true; // Set to true by default

document.addEventListener("DOMContentLoaded", async () => {
    const currentTab = await getCurrentTab();

    const currentUrl = currentTab.url;

    const queryParameters = currentUrl.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    const container = document.getElementsByClassName("container")[0];

    if (currentTab.url.includes("youtube.com/watch") && currentVideo) {
        // if audio is stored in local then show active/inactive button. active by default
        // chrome.storage.local.get("translatedAudio", (result) => {
        // const translatedAudio = result.translatedAudio;
        // });

        // if (translatedAudio) {
        //     // Translated audio is available, so show the active/inactive button
        //     showActiveInactiveButton();
        // }
    } else {
        // Not a YouTube video
        container.innerHTML = '<div class="title">transeleos only works on youtube videos</div>';
    }
});

// document.getElementById("submit").addEventListener("click", async () => {
//     await submitButtonEvent();
// });


// // Function to show the active/inactive button
// function showActiveInactiveButton() {
//     const audioInfoDiv = document.getElementById("audio-info");
//     audioInfoDiv.style.display = "block";

//     // Add an event listener to the toggle button
//     const toggleButton = document.getElementById("toggle-audio");

//     toggleButton.addEventListener("click", () => {
//         // Toggle the state and update the button text accordingly
//         isAudioActive = !isAudioActive;
//         toggleButton.textContent = isAudioActive ? "Make Inactive" : "Make Active";

//         // Based on the state, add event listeners
//         if (isAudioActive) {
//             // Add the event listener for "Make Active" action
//             toggleButton.removeEventListener("click", handleMakeInactive);
//             toggleButton.addEventListener("click", handleMakeActive);
//         } else {
//             // Add the event listener for "Make Inactive" action
//             toggleButton.removeEventListener("click", handleMakeActive);
//             toggleButton.addEventListener("click", handleMakeInactive);
//         }
//     });
// }

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "videoDurationCheck") {
        port.onMessage.addListener((message) => {
            if (message.type === "VIDEO_DURATION_EXCEED") {
                // Handle the video duration message
                const videoDuration = message.videoDuration;
                console.log("received duration exceed msg. videoDuration", videoDuration);

                const transeleosForm = document.getElementById("transeleos_form");
                transeleosForm.style.display = "none";

                isVideoLengthOk = false;

                showNotification("We only support translations for videos up to 10 minutes.", true);
            }
        });
    }
});


// const submitButtonEvent = async () => {
//     // Hide the select and submit button
//     const transeleosForm = document.getElementById("transeleos_form");
//     transeleosForm.style.display = "none";

//     // Show the loading container
//     const loadingContainer = document.getElementById("loading-container");
//     loadingContainer.style.display = "block";

//     // Capture the selected language from the #language select menu
//     const languageSelect = document.getElementById("language");
//     const selectedLanguage = languageSelect.value;

//     // Capture url from current tab
//     const currentTab = await getCurrentTab();
//     const currentUrl = currentTab.url;

//     // TODO: make this the actual server URL
//     const serverURL = "https://my-server-url.com/api/translate"

//     // Send the selected language to the server
//     try {
//         const response = await fetch(serverURL, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ language: selectedLanguage, url: currentUrl }),
//         });

//         if (response.ok) {
//             // Handle a potentially long response time from the server
//             const data = await response.json();

//             if (data.s3_url) {
//                 // Once a response with an S3 URL is received, fetch and store the file in local storage
//                 const audioResponse = await fetch(data.s3_url);
//                 const audioBlob = await audioResponse.blob();

//                 // Store the audio in local storage
//                 chrome.storage.local.set({ "translatedAudio": audioBlob }, () => {
//                     // hide the spinner
//                     loadingContainer.style.display = "none";

//                     const audioInfoDiv = document.getElementById("audio-info");
//                     const fileNameElement = document.getElementById("file-name");

//                     // Update the file name
//                     fileNameElement.textContent = fileName;

//                     // Show the audio info div
//                     audioInfoDiv.style.display = "block";
//                 });
//             } else {
//                 // Handle the case where the server didn't return an S3 URL
//                 showNotification("Server did not provide an audio URL.", true);
//                 loadingContainer.style.display = "none";
//                 transeleosForm.style.display = "block";
//             }
//         } else {
//             // Handle server response errors
//             showNotification(`Server returned an error: ${response.status} ${response.statusText}`, true);
//             loadingContainer.style.display = "none";
//             transeleosForm.style.display = "block";
//         }
//     } catch (error) {
//         // Handle fetch or other errors
//         showNotification(`An error occurred: ${error.message}`, true);
//         loadingContainer.style.display = "none";
//         transeleosForm.style.display = "block";
//     }
// }


// // Function to handle "Make Active" action
// function handleMakeActive() {
//     // Send a message to the content script to mute YouTube audio and play stored audio
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         chrome.tabs.sendMessage(tabs[0].id, { type: "MUTE_YOUTUBE_AUDIO" }, () => {
//             // After muting YouTube audio, you can play the stored audio
//             playStoredAudio();
//         });
//     });
// }

// // Function to play the stored audio
// function playStoredAudio(startTime = 0) {
//     // Get the audio data from local storage
//     chrome.storage.local.get("translatedAudio", (result) => {
//         const audioBlob = result.translatedAudio;
//         if (audioBlob) {
//             // Create an audio element and set the source to the audio blob
//             const audio = new Audio();
//             const audioURL = URL.createObjectURL(audioBlob);
//             audio.src = audioURL;

//             // Set the audio's current time to the specified start time
//             audio.currentTime = startTime;

//             // Play the audio
//             audio.play();
//         } else {
//             showNotification("No audio found in local storage.", true);
//         }
//     });
// }


// // Function to handle "Make Inactive" action
// function handleMakeInactive() {
//     // Send a message to the content script to unmute YouTube audio and mute stored audio
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         chrome.tabs.sendMessage(tabs[0].id, { type: "UNMUTE_YOUTUBE_AUDIO" }, () => {
//             // After unmuting YouTube audio, you can mute the stored audio
//             muteStoredAudio();
//         });
//     });
// }

// // Function to mute the stored audio
// function muteStoredAudio() {
//     // Get the audio element by its ID and pause it
//     const audio = document.querySelector("audio");
//     if (audio) {
//         audio.pause();
//     }
// }

// // Add a listener to handle messages from the content script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.type === "VIDEO_TIME_CHANGED") {
//         // Handle the video time change event
//         const videoTime = message.videoTime;

//         // Update the audio time based on the video time
//         playStoredAudio(videoTime);
//     }
// });