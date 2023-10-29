(async () => {
    let youtubePlayer;

    await chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type } = obj;

        if (type === "NEW_YOUTUBE_TAB") {
            // fetch youtube player stream
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
        }
    });
})();

// TODO: mute button when audio playing is enabled. else mute audio and turn this on
// youtubeMuteButton = document.getElementsByClassName("ytp-mute-button ytp-button")[0];

// TODO: jump to time in audio for the time on the youtube stream