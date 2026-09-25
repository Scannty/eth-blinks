// Finds <blk URL blk> tags on the page and replaces each with a sandboxed iframe
// that renders the blink. Blink JS runs inside the extension sandbox (not in the
// host page), and wallet calls are relayed to the page's window.ethereum through
// bridge.js, which runs in the page's main world.

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
const SANDBOX_URL = chrome.runtime.getURL("sandbox.html");

const blinkFrames = new Map(); // blinkId -> iframe
let nextBlinkId = 1;

function resolveBlinkUrl(raw) {
  const url = raw.trim();
  if (url.startsWith("http")) return url;
  if (url.startsWith("ipfs://")) return IPFS_GATEWAY + url.substring("ipfs://".length);
  return null;
}

function fetchBlink(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "fetchBlink", url }, (response) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!response || response.error) return reject(new Error(response ? response.error : "No response"));
      resolve(response);
    });
  });
}

function mountBlink(placeholder, url) {
  const blinkId = String(nextBlinkId++);
  const iframe = document.createElement("iframe");
  iframe.src = SANDBOX_URL;
  iframe.style.cssText = "width:100%;height:120px;border:0;display:block;background:transparent;";
  blinkFrames.set(blinkId, iframe);
  placeholder.appendChild(iframe);

  const blinkPromise = fetchBlink(url);
  iframe.addEventListener("load", async () => {
    try {
      const { html, js } = await blinkPromise;
      // Blinks used to be injected straight into the page, so pass along the text styles they would have inherited
      const { color, fontFamily, fontSize } = getComputedStyle(placeholder);
      iframe.contentWindow.postMessage({ type: "ephi:render", blinkId, html, js, style: { color, fontFamily, fontSize } }, "*");
    } catch (error) {
      console.error(`[Ephi] Failed to load blink ${url}:`, error);
      placeholder.textContent = `⚠️ Could not load blink (${error.message})`;
      blinkFrames.delete(blinkId);
    }
  });
}

function replaceBlkTags() {
  // Find all span elements containing <blk ... blk> or &lt;blk ... blk&gt;
  const spans = document.querySelectorAll("span");
  const blkRegex = /(&lt;|<)blk\s*(.*?)\s*blk(&gt;|>)/g;

  spans.forEach((span) => {
    if (!blkRegex.test(span.innerHTML)) return;
    blkRegex.lastIndex = 0;

    const pending = [];
    span.innerHTML = span.innerHTML.replace(blkRegex, (match, open, rawUrl) => {
      const url = resolveBlinkUrl(rawUrl.replace(/&amp;/g, "&"));
      if (!url) return match;
      const placeholderId = `ephi-blink-${nextBlinkId}-${pending.length}-${Date.now()}`;
      pending.push({ placeholderId, url });
      return `<div class="ephi-blink" id="${placeholderId}"></div>`;
    });

    pending.forEach(({ placeholderId, url }) => {
      const placeholder = document.getElementById(placeholderId);
      if (placeholder) mountBlink(placeholder, url);
    });
  });
}

// Messages coming from blink iframes
window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data.type !== "string" || !data.type.startsWith("ephi:")) return;

  const iframe = blinkFrames.get(data.blinkId);
  if (!iframe || event.source !== iframe.contentWindow) return;

  if (data.type === "ephi:resize") {
    iframe.style.height = `${Math.ceil(data.height)}px`;
  } else if (data.type === "ephi:rpc") {
    // Relay to bridge.js in the page's main world
    window.postMessage({ type: "ephi:bridge-request", blinkId: data.blinkId, rpcId: data.rpcId, method: data.method, params: data.params }, window.location.origin);
  }
});

// Responses and wallet events coming from bridge.js
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data) return;

  if (data.type === "ephi:bridge-response") {
    const iframe = blinkFrames.get(data.blinkId);
    if (iframe) iframe.contentWindow.postMessage({ type: "ephi:rpc-result", rpcId: data.rpcId, result: data.result, error: data.error }, "*");
  } else if (data.type === "ephi:bridge-event") {
    blinkFrames.forEach((iframe) => iframe.contentWindow.postMessage({ type: "ephi:wallet-event", event: data.event, payload: data.payload }, "*"));
  }
});

// Run the function every 1 second
setInterval(replaceBlkTags, 1000);
