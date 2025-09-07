// Popup script for Instagram Video Enhancer
// Compatible with both Chrome and Firefox
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  bindEvents();
  updateStatus();
});

// Use browser API (Firefox) or chrome API (Chrome)
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

function loadSettings() {
  browserAPI.storage.sync.get({
    autoEnhance: false,
    enableKeyboardShortcuts: true,
    quality: 'high'
  }, (settings) => {
    document.getElementById('autoEnhance').classList.toggle('active', settings.autoEnhance);
    document.getElementById('keyboardShortcuts').classList.toggle('active', settings.enableKeyboardShortcuts);
  });
}

function bindEvents() {
  // Toggle switches
  document.getElementById('autoEnhance').addEventListener('click', (e) => {
    toggleSetting(e.target, 'autoEnhance');
  });
  
  document.getElementById('keyboardShortcuts').addEventListener('click', (e) => {
    toggleSetting(e.target, 'enableKeyboardShortcuts');
  });
}

function toggleSetting(element, settingKey) {
  const isActive = element.classList.toggle('active');
  
  browserAPI.storage.sync.set({
    [settingKey]: isActive
  }, () => {
    updateStatus(`${settingKey} ${isActive ? 'enabled' : 'disabled'}`);
  });
}

function updateStatus(message = 'Ready to enhance Instagram videos!') {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  
  // Check if we're on Instagram
  browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url && currentTab.url.includes('instagram.com')) {
      statusElement.textContent = 'Extension active on Instagram!';
      statusElement.style.background = 'rgba(76, 175, 80, 0.2)';
      statusElement.style.borderColor = 'rgba(76, 175, 80, 0.3)';
    } else {
      statusElement.textContent = 'Visit Instagram to use the enhancer';
      statusElement.style.background = 'rgba(255, 193, 7, 0.2)';
      statusElement.style.borderColor = 'rgba(255, 193, 7, 0.3)';
    }
  });
}
