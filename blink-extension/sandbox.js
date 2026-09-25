// Runs inside the sandboxed blink iframe. Renders the blink's HTML/JS and exposes
// an EIP-1193 window.ethereum whose requests are relayed to the host page's wallet.
(function () {
  let blinkId = null;
  let nextRpcId = 1;
  const pendingRpcs = new Map();
  const listeners = {};

  window.ethereum = {
    isEphiBridge: true,
    request({ method, params }) {
      return new Promise((resolve, reject) => {
        const rpcId = nextRpcId++;
        pendingRpcs.set(rpcId, { resolve, reject });
        window.parent.postMessage({ type: "ephi:rpc", blinkId, rpcId, method, params }, "*");
      });
    },
    on(event, handler) {
      (listeners[event] = listeners[event] || []).push(handler);
      return this;
    },
    removeListener(event, handler) {
      listeners[event] = (listeners[event] || []).filter((h) => h !== handler);
      return this;
    },
  };

  let topOffset = 0;

  function reportHeight() {
    if (blinkId === null) return;

    // Some blinks use negative margins that relied on overflowing into the host page;
    // shift the content down so nothing is clipped at the top of the iframe.
    let minTop = Infinity;
    let maxBottom = 0;
    document.body.querySelectorAll("*").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      minTop = Math.min(minTop, rect.top);
      maxBottom = Math.max(maxBottom, rect.bottom);
    });
    if (minTop < 0) {
      topOffset += -minTop;
      document.body.style.paddingTop = `${topOffset}px`;
      maxBottom += -minTop;
    }

    const height = Math.max(document.body.scrollHeight, maxBottom);
    window.parent.postMessage({ type: "ephi:resize", blinkId, height }, "*");
  }

  function render(html, js, style) {
    if (style) Object.assign(document.body.style, style);
    document.body.innerHTML = html;

    // Scripts inserted via innerHTML don't execute, so re-create them
    document.body.querySelectorAll("script").forEach((old) => {
      const script = document.createElement("script");
      [...old.attributes].forEach((attr) => script.setAttribute(attr.name, attr.value));
      script.textContent = old.textContent;
      old.replaceWith(script);
    });

    const script = document.createElement("script");
    script.textContent = js;
    document.body.appendChild(script);

    new ResizeObserver(reportHeight).observe(document.body);
    document.querySelectorAll("img").forEach((img) => img.addEventListener("load", reportHeight));
    reportHeight();
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const data = event.data;
    if (!data) return;

    if (data.type === "ephi:render" && blinkId === null) {
      blinkId = data.blinkId;
      render(data.html, data.js, data.style);
    } else if (data.type === "ephi:rpc-result") {
      const pending = pendingRpcs.get(data.rpcId);
      if (!pending) return;
      pendingRpcs.delete(data.rpcId);
      if (data.error) {
        const error = new Error(data.error.message);
        error.code = data.error.code;
        error.data = data.error.data;
        pending.reject(error);
      } else {
        pending.resolve(data.result);
      }
    } else if (data.type === "ephi:wallet-event") {
      (listeners[data.event] || []).forEach((handler) => handler(data.payload));
    }
  });
})();
