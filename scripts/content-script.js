(async () => {
    let youtubePlayer, youtubeDuration;

    // let lastVideoTime = 0; // Store the last known video time

    // const transeleosDOMManus = async () => {
    await chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type } = obj;

        if (type === "NEW_YOUTUBE_TAB") {
            // fetch youtube player stream
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
            // youtube duration in minutes
            youtubeDuration = youtubePlayer.duration / 60;

            // youtubePlayer.addEventListener("timeupdate", () => {
            //     const videoTime = youtubePlayer.currentTime;

            //     // Check if the video time has changed
            //     if (videoTime !== lastVideoTime) {
            //         // Send an event to the popup script with the updated video time
            //         chrome.runtime.sendMessage({ type: "VIDEO_TIME_CHANGED", videoTime });

            //         // Update the last known video time
            //         lastVideoTime = videoTime;
            //     }
            // });

            // mute button class
            // youtubeMuteButton = document.getElementsByClassName("ytp-mute-button ytp-button")[0];
            // } else if (type === "MUTE_YOUTUBE_AUDIO") {
            //     // Mute the YouTube video's audio
            //     if (youtubePlayer) {
            //         youtubePlayer.muted = true;
            //     }
            // } else if (type === "UNMUTE_YOUTUBE_AUDIO") {
            //     // Unmute the YouTube video's audio
            //     if (youtubePlayer) {
            //         youtubePlayer.muted = false;
            //     }
        }
    });
    // }


})();