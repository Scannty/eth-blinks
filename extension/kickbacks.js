// World ID verification page for kickbacks. Opened from the X ticker panel with the logged-in
// X handle and the connected wallet. Runs as an extension page: IDKit needs WASM, which X's CSP would block.
(() => {
  const params = new URLSearchParams(location.search);
  const handle = params.get("handle") || "";
  const $ = (selector) => document.querySelector(selector);
  const walletInput = $(".wallet");
  const verifyButton = $(".verify");
  const status = $(".status");
  let cancelled = false;

  $(".name").textContent = handle ? `@${handle}` : "Not signed in to X";
  $(".scan-handle").textContent = handle ? `@${handle}` : "";
  walletInput.value = params.get("wallet") || "";

  // X profile picture, when the panel could read it; otherwise the handle's first letter
  const avatar = params.get("avatar") || "";
  const initial = $(".pfp .initial");
  initial.textContent = handle ? handle.replace(/^(0x|_)+/i, "").slice(0, 1).toUpperCase() : "?";
  if (avatar.startsWith("https://pbs.twimg.com/")) {
    const img = document.createElement("img");
    img.alt = "";
    img.src = avatar;
    img.onerror = () => img.replaceWith(initial);
    initial.replaceWith(img);
  }

  function setStep(step) {
    document.body.dataset.step = step;
    $(".form").hidden = step !== "form";
    $(".scan").hidden = step !== "scan";
    $(".done").hidden = step !== "done";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setStatus(text, kind) {
    status.hidden = !text;
    status.textContent = text || "";
    status.className = "status" + (kind ? " " + kind : "");
  }

  function api(op, body) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "kickbacks", op, body }, (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!response.ok) return reject(new Error(response.body.message || response.body.error || `Backend error ${response.status}`));
        resolve(response.body);
      });
    });
  }

  function showQr(uri, environment) {
    const qr = qrcode(0, "H"); // high error correction leaves room for the logo in the middle
    qr.addData(uri);
    qr.make();
    $(".qr .code").innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    $(".open").href = uri;
    $(".copy").onclick = async () => {
      await navigator.clipboard.writeText(uri);
      $(".copy").textContent = "Copied";
      setTimeout(() => { $(".copy").textContent = "Copy link"; }, 1500);
    };
    $(".staging").hidden = environment !== "staging";
    setStep("scan");
  }

  function shortAddress(address) {
    return address.slice(0, 6) + "…" + address.slice(-4);
  }

  function reset(message) {
    setStep("form");
    verifyButton.disabled = false;
    walletInput.disabled = false;
    setStatus(message, message ? "error" : "");
  }

  async function verify() {
    const wallet = walletInput.value.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) return setStatus("Enter a valid 0x wallet address.", "error");

    cancelled = false;
    verifyButton.disabled = true;
    walletInput.disabled = true;
    setStatus("Preparing World ID request…");
    try {
      const config = await api("rpContext");
      document.querySelectorAll(".pct").forEach((el) => { el.textContent = `${config.bips / 100}%`; });
      // Must match the backend's signal: the proof commits to this handle and wallet
      const signal = `${handle.toLowerCase()}:${wallet.toLowerCase()}`;
      const request = await IDKit.request({
        app_id: config.app_id,
        action: config.action,
        rp_context: config.rp_context,
        allow_legacy_proofs: true,
        environment: config.environment,
      }).preset(IDKit.proofOfHuman({ signal }));

      setStatus("");
      showQr(request.connectorURI, config.environment);
      const completion = await request.pollUntilCompletion({ pollInterval: 2000, timeout: 300000 });
      if (cancelled) return;
      if (!completion.success) {
        console.warn("[XSwap] World ID request failed", request.getDebugReport());
        const messages = {
          timeout: "World ID request timed out. Try again.",
          cancelled: "World ID request cancelled.",
          user_rejected: "You declined the request in World App. Nothing was shared.",
          verification_rejected: "You declined the request in World App. Nothing was shared.",
          credential_unavailable: "Kickbacks need Proof of Human, and this World ID isn't Orb-verified yet. Verify at an Orb, then try again.",
          max_verifications_reached: "This World ID already earns kickbacks for an X account. One human, one account.",
          nullifier_replayed: "This World ID already earns kickbacks for an X account. One human, one account.",
          connection_failed: "Couldn't reach World App. Check your connection and try again.",
        };
        throw new Error(messages[completion.error] || `World ID: ${completion.error}`);
      }

      setStatus("Verifying proof…");
      const registration = await api("register", { handle, wallet, result: completion.result });
      const pct = `${registration.bips / 100}%`;
      setStatus("");
      $(".done-copy").textContent = `From now on, when someone buys a ticker from one of your tweets, ${pct} of it goes to your wallet.`;
      $(".sum-handle").textContent = `@${registration.handle}`;
      $(".sum-wallet").textContent = shortAddress(registration.wallet);
      $(".sum-pct").textContent = `${pct} of each buy`;
      $(".me-sub").textContent = "Verified human · World ID";
      setStep("done");
    } catch (error) {
      if (!cancelled) reset(error.message);
    }
  }

  // The poll keeps running in the background after cancel; its result is ignored
  $(".cancel").addEventListener("click", () => { cancelled = true; reset(""); });
  $(".close-tab").addEventListener("click", () => window.close());

  if (!handle) {
    verifyButton.disabled = true;
    setStatus("Open this from a ticker card on x.com while signed in.", "error");
  }
  verifyButton.addEventListener("click", verify);
})();
