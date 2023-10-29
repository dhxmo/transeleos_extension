import { getCurrentTab, showNotification } from "../scripts/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const currentTab = await getCurrentTab();

    const currentUrl = currentTab.url;

    const queryParameters = currentUrl.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    const container = document.getElementsByClassName("container")[0];

    if (currentTab.url.includes("youtube.com/watch") && currentVideo) {
        const url = `http://159.89.168.249/get_video_duration?url=${currentUrl}`;

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
                console.error(`Error fetching video duration: ${error}`);
            });
    } else {
        // Not a YouTube video
        container.innerHTML = '<div class="title">transeleos only works on youtube videos</div>';
    }
});


// TODO: make fetch request to translate
// TODO: add active/inactive button
// TODO: store audio in s3
// TODO: fetch audio and find a wya to stream.
// IF active button turned on -> audio playing, mute youtube sound
// IF active button turned off -> yt audio playing. mute audio stream