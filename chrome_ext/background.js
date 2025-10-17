// Background service worker for Creative Corner Navigation Extension

const CREATIVE_CORNER_DOMAIN = 'flow-33.github.io';
const CREATIVE_CORNER_PATH = '/SapientCreativeCorner/';

// Track navigation state per tab
const tabStates = new Map();
const previousUrls = new Map(); // Track previous URLs for each tab

// Check if URL is from Creative Corner or localhost
function isCreativeCornerOrLocalhost(url) {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === CREATIVE_CORNER_DOMAIN && 
      urlObj.pathname.startsWith(CREATIVE_CORNER_PATH)
    ) || 
    urlObj.hostname === 'localhost' || 
    urlObj.hostname === '127.0.0.1';
  } catch (e) {
    return false;
  }
}

// Check if URL is external (not Creative Corner or localhost)
function isExternalSite(url) {
  try {
    const urlObj = new URL(url);
    return !isCreativeCornerOrLocalhost(url);
  } catch (e) {
    return false;
  }
}

// Store navigation state for a tab
function setTabState(tabId, referrerUrl) {
  tabStates.set(tabId, {
    referrerUrl: referrerUrl,
    shouldShowButtons: true,
    timestamp: Date.now()
  });
  
  // Store in session storage for persistence
  chrome.storage.session.set({
    [`tab_${tabId}`]: {
      referrerUrl: referrerUrl,
      shouldShowButtons: true,
      timestamp: Date.now()
    }
  });
  
  console.log('Navigation state set for tab', tabId, ':', referrerUrl);
}

// Get navigation state for a tab
async function getTabState(tabId) {
  // First check memory cache
  if (tabStates.has(tabId)) {
    return tabStates.get(tabId);
  }
  
  // Then check session storage
  try {
    const result = await chrome.storage.session.get(`tab_${tabId}`);
    const state = result[`tab_${tabId}`];
    if (state) {
      tabStates.set(tabId, state);
      return state;
    }
  } catch (e) {
    console.error('Error getting tab state from storage:', e);
  }
  
  return null;
}

// Clear navigation state for a tab
function clearTabState(tabId) {
  tabStates.delete(tabId);
  previousUrls.delete(tabId);
  chrome.storage.session.remove(`tab_${tabId}`);
  console.log('Navigation state cleared for tab', tabId);
}

// Listen for tab updates to track navigation
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    // Store the previous URL before navigation
    const previousUrl = previousUrls.get(tabId);
    if (previousUrl && isCreativeCornerOrLocalhost(previousUrl)) {
      // User is navigating away from Creative Corner or localhost
      console.log('User navigating away from Creative Corner/localhost:', previousUrl, '->', tab.url);
    }
  }
  
  if (changeInfo.status === 'complete' && tab.url) {
    const currentUrl = tab.url;
    
    // Store current URL as previous for next navigation
    previousUrls.set(tabId, currentUrl);
    
    // If navigating to external site, check if we came from Creative Corner or localhost
    if (isExternalSite(currentUrl)) {
      const previousUrl = previousUrls.get(tabId);
      if (previousUrl && isCreativeCornerOrLocalhost(previousUrl)) {
        // Set navigation state
        setTabState(tabId, previousUrl);
        console.log('Set navigation state:', previousUrl, '->', currentUrl);
        
        // Send message to content script to show buttons
        try {
          await chrome.tabs.sendMessage(tabId, {
            action: 'showButtons',
            referrerUrl: previousUrl
          });
        } catch (e) {
          // Content script might not be ready yet, will retry
          console.log('Content script not ready, will retry');
        }
      } else {
        // Check if we already have state for this tab
        const state = await getTabState(tabId);
        if (state && state.shouldShowButtons) {
          try {
            await chrome.tabs.sendMessage(tabId, {
              action: 'showButtons',
              referrerUrl: state.referrerUrl
            });
          } catch (e) {
            console.log('Content script not ready, will retry');
          }
        }
      }
    }
    // If navigating back to Creative Corner or localhost, clear state
    else if (isCreativeCornerOrLocalhost(currentUrl)) {
      clearTabState(tabId);
    }
  }
});

// Listen for navigation before it happens to capture the referrer
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const { tabId, url, frameId } = details;
  
  // Only process main frame navigation
  if (frameId !== 0) return;
  
  console.log('WebNavigation onBeforeNavigate:', { tabId, url, frameId });
  
  // If navigating to external site, check if current tab is Creative Corner or localhost
  if (isExternalSite(url)) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.url && isCreativeCornerOrLocalhost(tab.url)) {
        setTabState(tabId, tab.url);
        console.log('Set tab state from current URL (onBeforeNavigate):', tab.url, '->', url);
      }
    } catch (e) {
      console.error('Error in onBeforeNavigate:', e);
    }
  }
});

// Listen for web navigation to track referrers
chrome.webNavigation.onCommitted.addListener(async (details) => {
  const { tabId, url, transitionType, frameId } = details;
  
  // Only process main frame navigation
  if (frameId !== 0) return;
  
  // Skip if it's a reload or back/forward navigation
  if (transitionType === 'reload' || 
      transitionType === 'back_forward' || 
      transitionType === 'auto_subframe') {
    return;
  }
  
  console.log('WebNavigation onCommitted:', { tabId, url, transitionType, frameId });
  
  // If navigating to external site, check referrer
  if (isExternalSite(url)) {
    try {
      const tab = await chrome.tabs.get(tabId);
      
      // Check if this tab was opened from Creative Corner or localhost
      if (tab.openerTabId) {
        const openerTab = await chrome.tabs.get(tab.openerTabId);
        if (openerTab.url && isCreativeCornerOrLocalhost(openerTab.url)) {
          setTabState(tabId, openerTab.url);
          console.log('Set tab state from opener:', openerTab.url, '->', url);
        }
      }
      
      // Also check if we have a previous URL stored for this tab
      const previousUrl = previousUrls.get(tabId);
      if (previousUrl && isCreativeCornerOrLocalhost(previousUrl)) {
        setTabState(tabId, previousUrl);
        console.log('Set tab state from previous URL (webNavigation):', previousUrl, '->', url);
      }
    } catch (e) {
      console.error('Error checking navigation referrer:', e);
    }
  }
});

// Listen for tab removal to clean up state
chrome.tabs.onRemoved.addListener((tabId) => {
  clearTabState(tabId);
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getNavigationState') {
    getTabState(sender.tab.id).then(state => {
      sendResponse(state);
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'navigateToUrl') {
    chrome.tabs.update(sender.tab.id, { url: request.url });
    sendResponse({ success: true });
  }
});

// Clean up old tab states periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  
  for (const [tabId, state] of tabStates.entries()) {
    if (now - state.timestamp > maxAge) {
      clearTabState(tabId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

console.log('Creative Corner Navigation Extension background script loaded');