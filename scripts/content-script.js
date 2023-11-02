(async () => {
    let youtubePlayer, youtubePlayButton, youtubeRightControls, audioInfo, audioElement, popupMenu, buttonRect;

    console.log('Content script is running');

    // on new youtube tab, inject icon
    await chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
        const { type } = obj;

        if (type === "NEW_YOUTUBE_TAB") {
            console.log('Received NEW_YOUTUBE_TAB message');
            newVideoLoaded();
        }
    });

    // insert transeleos logo to youtube player
    const newVideoLoaded = async () => {
        // custom class to be added to the player
        const logoBtnExists = document.getElementsByClassName("logo-btn")[0];

        // if button doesnt exist, add it
        if (!logoBtnExists) {
            const logoBtn = document.createElement("img");

            logoBtn.src = chrome.runtime.getURL("assets/logo-no-bg.png");
            logoBtn.className = "ytp-button " + "logo-btn";
            logoBtn.title = "Click to transeleos";

            //  left side control buttons
            //  mute button class --> ytp-mute-button ytp-button
            youtubeRightControls = document.getElementsByClassName("ytp-right-controls")[0];
            youtubePlayButton = document.getElementsByClassName("ytp-play-button")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            if (youtubePlayer && youtubePlayer.duration / 60 < 10) {
                if (logoBtn.parentNode !== youtubeRightControls) {
                    // Append logoBtn as the first child of youtubeRightControls
                    youtubeRightControls.insertBefore(logoBtn, youtubeRightControls.firstChild);
                }

                //  on logo click, open widget window
                logoBtn.addEventListener("click", (event) => openTranseleosEventHandler(event));
            }
        } else {
            console.log('Logo button already exists.');
        }
    }

    let isPopupVisible = false; // Track the visibility state

    // on logo click, open widget window
    const openTranseleosEventHandler = async (event) => {
        if (isPopupVisible) {
            // If the popup is visible, hide it
            popupMenu = document.getElementById('transeleos-widget');
            if (popupMenu) {
                popupMenu.style.display = 'none';
            }
            isPopupVisible = false;
        } else {
            // If the popup is not visible, show it
            popupMenu = document.getElementById('transeleos-widget');
            if (popupMenu) {
                popupMenu.style.display = 'block';
            } else {
                // Create the popup menu if it doesn't exist
                buttonRect = event.target.getBoundingClientRect();
                popupMenu = document.createElement('div');
                popupMenu.id = 'transeleos-widget';
                popupMenu.innerHTML = `
                <div id="notification" style="display: none"></div>

                <select id="transeleos-languages" style="padding: 5px; border-radius: 5px;">
                    <option value="chinese-simplified">Chinese, simplified</option>
                    <option value="english">English</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="hindi">Hindi</option>
                    <option value="italian">Italian</option>
                    <option value="japanese">Japanese</option>
                    <option value="polish">Polish</option>
                    <option value="portugese">Portugese</option>
                    <option value="russian">Russian</option>
                    <option value="spanish">Spanish</option>
                    <option value="turkish">Turkish</option>
                </select>
                <button id="transeleos-submit"
                        style="margin-left: 20px; padding: 5px; border-radius: 5px;">transeleos!</button>

                <div id="audio-info" style="display: none; margin-top: 30px;">
                    <audio id="transeleos-translated-audio" controls></audio>
                </div>
                </div>
                `;
                popupMenu.style.position = 'absolute';
                popupMenu.style.top = buttonRect.top - popupMenu.offsetHeight - 100 + 'px';
                popupMenu.style.left = buttonRect.left + 'px';
                popupMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'; // Light black overlay
                popupMenu.style.padding = '40px'; // Add padding
                popupMenu.style.borderRadius = '5px'; // Rounded corners
                popupMenu.style.zIndex = '9999';

                // Append the popup menu to the body or a parent container
                document.body.appendChild(popupMenu);

                // Add an event listener for button click
                const submitButton = document.getElementById("transeleos-submit");
                audioInfo = document.getElementById("audio-info");
                audioElement = document.getElementById("transeleos-translated-audio");

                // once audio elemnt is made, keep it synced up with the youtube player
                syncAudioWithYT();

                // Add an event listener to the audio element for time updates
                audioElement.addEventListener('timeupdate', handleAudioStateChange);

                const languageSelect = document.getElementById("transeleos-languages");
                const selectedLanguage = languageSelect.value;

                // on submit button press, fetch audio from s3 and load to local
                submitButton.addEventListener("click", () => {
                    try {
                        chrome.runtime.sendMessage({
                            type: 'FETCH_AUDIO',
                            language: selectedLanguage
                        });
                    } catch (error) {
                        console.error('Error sending FETCH_AUDIO message:', error);
                    }

                });
            }
            isPopupVisible = true;
        }
    };

    // display audio tag in widget
    const displayAudioInfo = () => {
        // show audio div
        audioInfo.style.display = "block";
        audioElement.setAttribute('controls', 'true'); // By default, make the audio tag clickable
        popupMenu.style.top = buttonRect.top - popupMenu.offsetHeight + 'px';
    }

    // AUDIO_FETCHED store fetched audio to local storage
    await chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.type === "AUDIO_FETCHED") {

            const dataUrl = message.audioDataUrl;
            // Convert the data URL to a Blob
            const audioBlob = dataURLtoBlob(dataUrl);

            if (audioBlob instanceof Blob) {
                displayAudioInfo();

                console.log("audio loaded");

                const audioURL = URL.createObjectURL(audioBlob);
                audioElement.src = audioURL; // Set the source
                audioElement.currentTime = youtubePlayer.currentTime;
                audioElement.play(); // Play the audio

                // Mute the video's audio
                youtubePlayer.muted = true;

                // // Play the video
                await youtubePlayer.play();

                // Synchronize the audio's time with the video's time
                youtubePlayer.addEventListener('timeupdate', () => {
                    audioElement.currentTime = youtubePlayer.currentTime;
                });

                // Set the local state variables
                const audioState = {
                    youtubeUrl: message.youtubeUrl,
                    audioDataUrl: message.audioDataUrl,
                    s3AudioURL: message.s3AudioURL,
                    fetchLanguage: message.fetchLanguage,
                    audioTimestamp: audioElement.currentTime
                }
                chrome.storage.local.set({ audioState });
            }
        }
    });

    // convert audio url to blob
    function dataURLtoBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
    }

    // Function to handle play and pause events
    function handleAudioStateChange() {
        let localAudioState;

        chrome.storage.local.get('audioState', (result) => {
            localAudioState = result.audioState;

            if (localAudioState) {
                const audioState = {
                    youtubeUrl: localAudioState.youtubeUrl,
                    audioDataUrl: localAudioState.audioDataUrl,
                    s3AudioURL: localAudioState.s3AudioURL,
                    fetchLanguage: localAudioState.fetchLanguage,
                    audioTimestamp: audioElement.currentTime
                };
                chrome.storage.local.set({ audioState });
            } else {
                chrome.storage.local.set({ localAudioState });
            }
        });
    }

    // Function to keep audio tag and youtube player in sync
    function syncAudioWithYT() {
        audioElement.addEventListener('play', () => {
            youtubePlayer.play();
        });

        audioElement.addEventListener('pause', () => {
            youtubePlayer.pause();
        });

        youtubePlayer.addEventListener('play', () => {
            audioElement.play();
        });

        youtubePlayer.addEventListener('pause', () => {
            audioElement.pause();
        });
    }

    // display icon youtube player
    newVideoLoaded();
})();

// On audio fetch start playing the video. mute its audio, play the translated audio

// the timestamps need to be linked

// toggle active/inactive. if pressed, mute fetched audio and play yt audio

// TODO: mute button when audio playing is enabled. else mute audio and turn this on
// youtubeMuteButton = document.getElementsByClassName("ytp-mute-button ytp-button")[0];

// TODO: jump to time in audio for the time on the youtube stream

// TODO: read playback speed from youtube player and reflect in audio 

// TODO: store and fetch audioData specific to the video. use video URL