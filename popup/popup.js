import { getCurrentTab } from "../scripts/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const currentTab = await getCurrentTab();
    const queryParameters = currentTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    // if youtube video, show transeleosed audio from chrome.storage.sync.get
    if (currentTab.url.includes("youtube.com/watch") && currentVideo) {

    } else {
        // not youtube video
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">Cannot transeleos on a non youtube page</div>';
    }
});