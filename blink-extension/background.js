// Fetches blink JSON on behalf of content scripts. Running the fetch here (with
// host_permissions) avoids the host page's CORS and CSP restrictions.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "fetchBlink") return;

  fetch(message.url)
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      const result = await response.json();
      const { html, js } = result.iframe;
      sendResponse({ html, js });
    })
    .catch((error) => sendResponse({ error: error.message }));

  return true; // Indicate that the response will be sent asynchronously
});
