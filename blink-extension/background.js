chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "eval") {
    try {
      // Use Function constructor instead of eval for better security  
      const result = new Function(message.code)();
      sendResponse({ result });
    } catch (error) {
      sendResponse({ error: error.message });
    }
    // Use sendResponse correctly with a clear indication of asynchronous behav
    return true; 
  }
});
