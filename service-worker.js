let localTabId, localTabURL;

// inform service worker about new youtube tab
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {

    localTabId = tabId;
    localTabURL = tab.url;

    try {
      chrome.tabs.sendMessage(tabId, {
        type: "NEW_YOUTUBE_TAB",
        currentURL: tab.url
      });
    } catch (error) {
      console.error('Error sending NEW_YOUTUBE_TAB message:', error);
    }
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'TRANSLATE_AUDIO') { }
});


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // const outputLang = request.output_lang
  // currentURL = localTabURL
  if (request.type === 'FETCH_AUDIO') {

    const selectedLanguage = request.language;

    // send to server to return s3 url
    // const s3AudioURL = .....

    const s3AudioURL = "https://giffe.s3.ap-south-1.amazonaws.com/translated_audio/Jje5VN0bpjc/Jje5VN0bpjc.mp3";

    try {
      // Load s3 audio url to blob
      const blobResponse = await loadAndPlayAudio(s3AudioURL);

      if (blobResponse instanceof Blob) {
        // read blob and create url to send to content-script
        const reader = new FileReader();
        reader.onload = function () {
          const dataUrl = reader.result;
          try {
            chrome.tabs.sendMessage(localTabId, {
              type: "AUDIO_FETCHED",
              youtubeUrl: localTabURL,
              audioDataUrl: dataUrl, // Send the data URL
              s3AudioURL: s3AudioURL,
              fetchLanguage: selectedLanguage
            });
          } catch (error) {
            console.error('Error sending AUDIO_FETCHED message:', error);
          }
        };
        // save blob as url
        reader.readAsDataURL(blobResponse);
      } else {
        console.error("Invalid Blob response.");
      }
    } catch (error) {
      console.error("Error while fetching and playing audio:", error);
    }
  }
});

// fetch s3 audio and load to blob
const loadAndPlayAudio = async (s3AudioURL) => {
  const blobResponse = fetch(s3AudioURL, { mode: 'no-cors' })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    });

  return blobResponse;
}