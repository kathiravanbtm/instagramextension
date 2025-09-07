// Background script for Instagram Video Enhancer
chrome.runtime.onInstalled.addListener(() => {
  console.log('Instagram Video Enhancer installed');
  
  // Set default settings
  chrome.storage.sync.set({
    autoEnhance: false,
    defaultZoom: 1,
    enableKeyboardShortcuts: true,
    quality: 'high'
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'downloadVideo':
      handleVideoDownload(request.url, request.filename);
      break;
    case 'getSettings':
      chrome.storage.sync.get(null, (settings) => {
        sendResponse(settings);
      });
      return true;
    case 'saveSettings':
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ success: true });
      });
      return true;
  }
});

function handleVideoDownload(url, filename) {
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  });
}

// Context menu for quick actions
chrome.contextMenus.create({
  id: 'enhanceVideo',
  title: 'Enhance Instagram Video',
  contexts: ['video'],
  documentUrlPatterns: [
    'https://www.instagram.com/*',
    'https://instagram.com/*'
  ]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'enhanceVideo') {
    chrome.tabs.sendMessage(tab.id, { action: 'enhanceCurrentVideo' });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'enhanceVideo') {
    chrome.tabs.sendMessage(tab.id, { action: 'enhanceCurrentVideo' });
  }
});
