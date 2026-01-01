// Service worker for AI Inline Reply extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Inline Reply extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_ANNOTATIONS') {
    chrome.storage.local.get([message.conversationId], (result) => {
      sendResponse(result[message.conversationId] || []);
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'SAVE_ANNOTATIONS') {
    chrome.storage.local.set({
      [message.conversationId]: message.annotations
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
