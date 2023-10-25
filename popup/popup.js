import { getCurrentTab } from "../scripts/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const currentTab = await getCurrentTab();

    const currentUrl = currentTab.url;

    const queryParameters = currentUrl.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    // TODO: if youtube video, show transeleosed audio if there is anything in chrome.storage.sync.get
    if (currentTab.url.includes("youtube.com/watch") && currentVideo) {

        // TODO: if audio is stored in localthen show active/inactive button. active by default

    } else {
        // not youtube video
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">transeleos only works on youtube videos</div>';
    }
});


// TODO: if active button is pressed send message type = "ACTIVE"

// TODO: if (toggle active) inactive nutton is pressed, snd message type = "INACTIVE"

// TODO: capture language from #language select menu and send to server
// - wait for response from server
// - once received s3 url, fetch and store the file in local storage