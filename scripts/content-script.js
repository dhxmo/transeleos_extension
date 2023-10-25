(() => {
    let youtubePlayer;
    // let youtubePlayerHopTo;
    // let youtubeMuteButton;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type } = obj;

        if (type === "NEW") {
            // fetch youtube player stream
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            // hop to in audio stream
            // youtubePlayerHopTo = youtubePlayer.currentTime;

            // mute button class
            // youtubeMuteButton = document.getElementsByClassName("ytp-mute-button ytp-button")[0];
        } else if (type === "MUTE_YOUTUBE_AUDIO") {
            // Mute the YouTube video's audio
            if (youtubePlayer) {
                youtubePlayer.muted = true;
            }
        } else if (type === "UNMUTE_YOUTUBE_AUDIO") {
            // Unmute the YouTube video's audio
            if (youtubePlayer) {
                youtubePlayer.muted = false;
            }
        }
    });
})();