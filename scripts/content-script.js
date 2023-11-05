(async () => {
    let currentURL, youtubePlayer, youtubePlayButton,
        youtubeRightControls, audioInfo, selectedLanguage,
        audioElement, popupMenu, buttonRect;

    console.log('Content script is running');

    // on new youtube tab, inject icon
    await chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "NEW_YOUTUBE_TAB") {
            currentURL = message.currentURL;
            newVideoLoaded();
        }
    });

    // insert transeleos logo to youtube player
    const newVideoLoaded = async () => {
        console.log("new video loaded");
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
    // FETCH_AUDIO msg sent when necessary
    const openTranseleosEventHandler = async (event) => {
        console.log("openTranseosEventHandler");
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
                    <option value="bg">Български</option>
                    <option value="cz">Čeština</option>
                    <option value="da">Dansk</option>
                    <option value="de">Deutsch</option>
                    <option value="el">Ελληνικά</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="et">Eesti</option>
                    <option value="fa">فارسی</option>
                    <option value="fi">Suomi</option>
                    <option value="fr">Français</option>
                    <option value="hr">Hrvatski</option>
                    <option value="hu">Magyar</option>
                    <option value="it">Italiano</option>
                    <option value="ja">日本語</option>
                    <option value="lv">Latviešu</option>
                    <option value="lt">Lietuvių</option>
                    <option value="mt">Malti</option>
                    <option value="nl">Nederlands</option>
                    <option value="pl">Polski</option>
                    <option value="pt">Português</option>
                    <option value="ro">Română</option>
                    <option value="sk">Slovenčina</option>
                    <option value="sv">Svenska</option>
                    <option value="tr">Türkçe</option>
                    <option value="zh-CN">简体中文</option>
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
                popupMenu.style.left = buttonRect.left + 'px';                // If it's unmuted, mute the YouTube player

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

                youtubePlayer.addEventListener('seeking', () => {
                    audioElement.currentTime = youtubePlayer.currentTime;
                });

                const languageSelect = document.getElementById("transeleos-languages");
                languageSelect.addEventListener("change", (event) => {
                    selectedLanguage = event.target.value;
                });

                // on submit button press, fetch audio from s3 and load to local
                submitButton.addEventListener("click", async () => {
                    console.log("submit button clicked");
                    try {
                        chrome.storage.local.get('audioState', async (result) => {
                            console.log("getting local audio");
                            const audioState = result.audioState;

                            // Extract video ID (v) from youtubeUrl
                            const videoIDMatch = currentURL.match(/[?&]v=([^&]+)/);
                            const videoID = videoIDMatch ? videoIDMatch[1] : null;

                            // Extract the filename (without extension) from s3Url
                            const s3UrlParts = audioState.s3AudioURL.split("/");
                            const s3FilenameWithExtension = s3UrlParts[s3UrlParts.length - 1];
                            const s3Filename = s3FilenameWithExtension.split(".")[0];

                            // Audio data exists in local storage for selected language 
                            if (audioState &&
                                audioState.youtubeUrl === currentURL &&
                                audioState.fetchLanguage === selectedLanguage &&
                                videoID === s3Filename) {
                                const dataUrl = audioState.audioDataUrl;
                                await fetchAndSetAudio(dataUrl, audioState);
                            } else {
                                // Audio data doesn't exist in local storage, fetch it
                                console.log("fetching audio from server");
                                try {
                                    chrome.runtime.sendMessage({
                                        type: 'FETCH_AUDIO',
                                        url: currentURL,
                                        language: selectedLanguage
                                    });
                                } catch (error) {
                                    console.error('Error sending FETCH_AUDIO message:', error);
                                }
                            }
                        });
                    } catch (error) {
                        console.error('Error fetching audio from local:', error);
                    }
                });
            }
            isPopupVisible = true;
        }
    };

    // display audio tag in widget
    const displayAudioInfo = () => {
        console.log("displayAudioInfo");
        // show audio div
        audioInfo.style.display = "block";
        audioElement.setAttribute('controls', 'true'); // By default, make the audio tag clickable
        popupMenu.style.top = buttonRect.top - popupMenu.offsetHeight + 'px';
    }

    // AUDIO_FETCHED store fetched audio to local storage
    await chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.type === "AUDIO_FETCHED") {
            const dataUrl = message.audioDataUrl;
            await fetchAndSetAudio(dataUrl, message);
        }
    });

    // convert url to blob and set audio element. also set audio in local storage
    const fetchAndSetAudio = async (dataUrl, message) => {
        console.log("fetched audio from local storage");
        // Convert the data URL to a Blob
        const audioBlob = dataURLtoBlob(dataUrl);

        if (audioBlob instanceof Blob) {
            displayAudioInfo();

            const audioURL = URL.createObjectURL(audioBlob);
            audioElement.src = audioURL; // Set the source
            audioElement.currentTime = youtubePlayer.currentTime;

            audioElement.playbackRate = youtubePlayer.playbackRate;
            // audioElement.play(); // Play the audio

            // Mute the video's audio
            youtubePlayer.muted = true;

            // // Play the video
            await youtubePlayer.play();

            // Add an event listener to the YouTube player's ratechange event
            youtubePlayer.addEventListener('ratechange', syncAudioSpeedWithPlayer);

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
        console.log("handleAudioStateChange");
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
        console.log("syncAudioWithYT");
        audioElement.addEventListener('play', () => {
            console.log("play event listeners");
            youtubePlayer.play();
        });

        audioElement.addEventListener('pause', () => {
            console.log("pause event listeners");
            youtubePlayer.pause();
        });

        audioElement.addEventListener('volumechange', () => {
            console.log("volume change initiated");
            if (audioElement.muted) {
                youtubePlayer.muted = false;
            } else {
                youtubePlayer.muted = true;
            }
        });

        youtubePlayer.addEventListener('play', () => {
            audioElement.play();
        });

        youtubePlayer.addEventListener('pause', () => {
            audioElement.pause();
        });
    }

    // Function to synchronize audio speed with YouTube player speed
    function syncAudioSpeedWithPlayer() {
        console.log("syncing rate change");
        const playerSpeed = youtubePlayer.playbackRate;
        audioElement.playbackRate = playerSpeed;
    }

    // display icon youtube player
    newVideoLoaded();
})();


// TODO: add 'please wait, this could take 5-10 minutes' notification

// TODO: store and fetch audioData specific to the video. use video URL