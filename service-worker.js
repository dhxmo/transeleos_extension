chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {

    chrome.tabs.sendMessage(tabId, {
      type: "NEW_YOUTUBE_TAB"
    });
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setPopDown") {
    chrome.action.setPopup({ popup: 'popup/popdown.html' });
  } else if (message.action === "setPopUp") {
    chrome.action.setPopup({ popup: 'popup/popup.html' });
  }
});
