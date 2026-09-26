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

  // Intercepta security checks. token: GET /intercepta/token/:chainId/:address, transaction: POST /intercepta/transaction/:chainId
  if (message.action === "intercepta") {
    const request = message.check === "token"
      ? fetch(`${BACKEND_URL}/intercepta/token/${Number(message.chainId)}/${encodeURIComponent(message.address)}`)
      : fetch(`${BACKEND_URL}/intercepta/transaction/${Number(message.chainId)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message.body),
        });
    request
      .then(async (response) => {
        const text = await response.text();
        let body;
        try { body = JSON.parse(text); } catch { body = { message: text }; }
        sendResponse({ ok: response.ok, status: response.status, body });
      })
      .catch((error) => sendResponse({ ok: false, status: 0, body: { message: `Ephi backend not reachable at ${BACKEND_URL} (${error.message})` } }));
    return true;
  }

  // Kickbacks registry. get: GET /kickbacks/:handle, rpContext: POST /kickbacks/rp-context, register: POST /kickbacks/register
  if (message.action === "kickbacks") {
    const request = message.op === "get"
      ? fetch(`${BACKEND_URL}/kickbacks/${encodeURIComponent(message.handle)}`)
      : fetch(`${BACKEND_URL}/kickbacks/${message.op === "register" ? "register" : "rp-context"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message.body || {}),
        });
    request
      .then(async (response) => {
        const text = await response.text();
        let body;
        try { body = JSON.parse(text); } catch { body = { message: text }; }
        sendResponse({ ok: response.ok, status: response.status, body });
      })
      .catch((error) => sendResponse({ ok: false, status: 0, body: { message: `Ephi backend not reachable at ${BACKEND_URL} (${error.message})` } }));
    return true;
  }

  // Opens the World ID verification page (content scripts can't open extension pages themselves)
  if (message.action === "openKickbacks") {
    const params = new URLSearchParams({ handle: message.handle || "", wallet: message.wallet || "", avatar: message.avatar || "" });
    chrome.tabs.create({ url: chrome.runtime.getURL(`kickbacks.html?${params}`), openerTabId: sender.tab && sender.tab.id });
  }
});
