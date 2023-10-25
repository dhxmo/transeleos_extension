(() => {
    let youtubePlayer;
    let youtubePlayerHopTo;
    let youtubeMuteButton;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type } = obj;

        if (type === "NEW") {
            // fetch youtube player stream
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            // hop to in audio stream
            youtubePlayerHopTo = youtubePlayer.currentTime;

            // mute button class
            youtubeMuteButton = document.getElementsByClassName("ytp-mute-button ytp-button")[0];
        } else if (type === "ACTIVE") {
            // if active --> mute youtube audio --->  play translated audio

            youtubePlayer.currentTime = value;
        } else if (type === "INACTIVE") {
            // if inactive --> mute translated audio ---> play youtube audio
        }
    });

    const newVideoLoaded = () => {

    }

    // TODO: get audio file stored locally for the current video: chrome.storage.sync.get

    // TODO: on play button on youtube player, 
    // mute the video
    // play audio from storage
    // sync on timestamp

    newVideoLoaded();
})();