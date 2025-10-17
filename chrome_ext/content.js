// Content script for Creative Corner Navigation Extension

let navigationButtons = null;
let referrerUrl = null;

// Check if buttons should be shown on this page
async function shouldShowButtons() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getNavigationState' });
    console.log('shouldShowButtons response:', response);
    return response && response.shouldShowButtons;
  } catch (e) {
    console.error('Error checking navigation state:', e);
    return false;
  }
}

// Create floating navigation buttons
function createNavigationButtons() {
  if (navigationButtons) {
    return; // Already created
  }

  const container = document.createElement('div');
  container.id = 'cc-nav-buttons';
  container.className = 'cc-nav-container';
  
  container.innerHTML = `
    <button id="cc-back-btn" class="cc-nav-btn" title="Back to Creative Corner">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      <span>Back</span>
    </button>
    <button id="cc-home-btn" class="cc-nav-btn" title="Go to Creative Corner Home">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
      <span>Home</span>
    </button>
  `;

  // Add event listeners
  const backBtn = container.querySelector('#cc-back-btn');
  const homeBtn = container.querySelector('#cc-home-btn');

  backBtn.addEventListener('click', handleBackClick);
  homeBtn.addEventListener('click', handleHomeClick);

  // Add to page
  document.body.appendChild(container);
  navigationButtons = container;

  // Add entrance animation
  setTimeout(() => {
    container.classList.add('cc-nav-visible');
  }, 100);
}

// Handle back button click
async function handleBackClick() {
  try {
    if (referrerUrl) {
      await chrome.runtime.sendMessage({
        action: 'navigateToUrl',
        url: referrerUrl
      });
    } else {
      // Fallback to Creative Corner home
      await chrome.runtime.sendMessage({
        action: 'navigateToUrl',
        url: 'https://flow-33.github.io/SapientCreativeCorner/'
      });
    }
  } catch (e) {
    console.error('Error navigating back:', e);
  }
}

// Handle home button click
async function handleHomeClick() {
  try {
    await chrome.runtime.sendMessage({
      action: 'navigateToUrl',
      url: 'https://flow-33.github.io/SapientCreativeCorner/'
    });
  } catch (e) {
    console.error('Error navigating home:', e);
  }
}

// Remove navigation buttons
function removeNavigationButtons() {
  if (navigationButtons) {
    navigationButtons.classList.remove('cc-nav-visible');
    setTimeout(() => {
      if (navigationButtons && navigationButtons.parentNode) {
        navigationButtons.parentNode.removeChild(navigationButtons);
      }
      navigationButtons = null;
    }, 300);
  }
}

// Initialize the content script
async function init() {
  console.log('Creative Corner Navigation content script initializing on:', window.location.href);
  console.log('Document referrer:', document.referrer);
  
  // Check if we should show buttons
  const shouldShow = await shouldShowButtons();
  console.log('Should show buttons:', shouldShow);
  
  // Fallback: Check if we came from Creative Corner or localhost based on referrer
  if (!shouldShow && document.referrer) {
    const docReferrer = document.referrer;
    console.log('Checking document referrer:', docReferrer);
    
    // Check if referrer is Creative Corner or localhost
    try {
      const referrerObj = new URL(docReferrer);
      const isFromCreativeCorner = (
        referrerObj.hostname === 'flow-33.github.io' && 
        referrerObj.pathname.startsWith('/SapientCreativeCorner/')
      );
      const isFromLocalhost = (
        referrerObj.hostname === 'localhost' || 
        referrerObj.hostname === '127.0.0.1'
      );
      
      if (isFromCreativeCorner || isFromLocalhost) {
        console.log('Detected navigation from Creative Corner/localhost via referrer:', docReferrer);
        referrerUrl = docReferrer;
        createNavigationButtons();
        return;
      }
    } catch (e) {
      console.error('Error parsing referrer URL:', e);
    }
  }
  
  if (shouldShow) {
    // Get referrer URL from background script
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getNavigationState' });
      console.log('Navigation state response:', response);
      if (response && response.referrerUrl) {
        referrerUrl = response.referrerUrl;
        console.log('Referrer URL set to:', referrerUrl);
      }
    } catch (e) {
      console.error('Error getting referrer URL:', e);
    }
    
    createNavigationButtons();
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showButtons') {
    referrerUrl = request.referrerUrl;
    createNavigationButtons();
    sendResponse({ success: true });
  } else if (request.action === 'hideButtons') {
    removeNavigationButtons();
    sendResponse({ success: true });
  }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, no action needed
  } else {
    // Page is visible, re-check if buttons should be shown
    init();
  }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  removeNavigationButtons();
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also initialize after a short delay to ensure page is fully loaded
setTimeout(init, 1000);
