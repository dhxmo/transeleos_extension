(() => {
    let youtubePlayer;
    let youtubePlayerHopTo;
    let youtubeMuteButton;

    let currentTabUrl = "";
    let currentVideo = "";

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, tabUrl, videoId } = obj;

        if (type === "NEW") {
            currentTabUrl = tabUrl;
            currentVideo = videoId;

            newVideoLoaded();
        } else if (type === "PLAY") {
            // if play --> from onPlay ---> move youtubePlayer to to value

            youtubePlayer.currentTime = value;
        } else if (type === "PAUSE") {
            // if pause --> pause audio from playbacking against video 
        }
    });

    const newVideoLoaded = () => {
        // fetch youtube player stream
        youtubePlayer = document.getElementsByClassName("video-stream")[0];
        // hop to in audio stream
        youtubePlayerHopTo = youtubePlayer.currentTime;
        // mute button class
        youtubeMuteButton = document.getElementsByClassName("ytp-mute-button ytp-button")[0];
    }

    // get audio file stored locally for the current video
    // const fetchBookmarks = () => {
    //     return new Promise((resolve) => {
    //         chrome.storage.sync.get([currentVideo], (obj) => {
    //             resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
    //         });
    //     });
    // };

    newVideoLoaded();
})();