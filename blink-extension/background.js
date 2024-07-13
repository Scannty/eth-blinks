chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "eval") {
    
    try {
      //alert(message.code);
      const result = eval("(()=>{"+message.code+"})()");
      sendResponse({ result });
    } catch (error) {
      sendResponse({ error: error.message });
    }
    return true; // Indicate that the response will be sent asynchronously
  }
});
