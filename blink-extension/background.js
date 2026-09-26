// Ephi backend (blink-back-end). Proxies the Uniswap Trading API so the API key stays server-side.
const BACKEND_URL = "http://localhost:8000";

// Fetches run here (with host_permissions) to avoid the host page's CORS and CSP restrictions.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchBlink") {
    fetch(message.url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
        const result = await response.json();
        const { html, js } = result.iframe;
        sendResponse({ html, js });
      })
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Indicate that the response will be sent asynchronously
  }

  if (message.action === "uniswap") {
    fetch(`${BACKEND_URL}/uniswap/${message.endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.body),
    })
      .then(async (response) => {
        const text = await response.text();
        let body;
        try { body = JSON.parse(text); } catch { body = { message: text }; }
        sendResponse({ ok: response.ok, status: response.status, body });
      })
      .catch((error) => sendResponse({ ok: false, status: 0, body: { message: `Ephi backend not reachable at ${BACKEND_URL} (${error.message})` } }));
    return true;
  }
});
