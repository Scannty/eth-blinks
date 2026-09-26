// Runs in the page's main world, where the wallet injects window.ethereum.
// Executes EIP-1193 requests relayed from the ticker swap panel (x-ticker-swap.js).
(function () {
  let subscribed = false;

  function subscribeToWalletEvents() {
    if (subscribed || !window.ethereum || typeof window.ethereum.on !== "function") return;
    subscribed = true;
    ["accountsChanged", "chainChanged", "connect", "disconnect"].forEach((event) => {
      window.ethereum.on(event, (payload) => {
        window.postMessage({ type: "xswap:bridge-event", event, payload: JSON.parse(JSON.stringify(payload ?? null)) }, window.location.origin);
      });
    });
  }

  window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.type !== "xswap:bridge-request") return;

    const respond = (result, error) =>
      window.postMessage({ type: "xswap:bridge-response", sourceId: data.sourceId, rpcId: data.rpcId, result, error }, window.location.origin);

    if (typeof window.ethereum === "undefined") return respond(undefined, { code: 4900, message: "No wallet found. Install MetaMask or another browser wallet." });

    subscribeToWalletEvents();
    try {
      const result = await window.ethereum.request({ method: data.method, params: data.params });
      respond(JSON.parse(JSON.stringify(result ?? null)));
    } catch (error) {
      respond(undefined, { code: error.code, message: error.message, data: error.data });
    }
  });
})();
