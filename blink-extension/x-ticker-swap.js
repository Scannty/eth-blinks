// Uniswap blink for X ticker cards.
// X renders a ticker card (icon, name, price, change, sparkline) for cashtags like $ETH.
// This script attaches a swap panel directly below that card, styled to look like part of it.
(() => {
  const BLINK_ID = "x-ticker-swap";
  const HOST_ATTR = "data-ephi-ticker-swap";

  // Tickers we can route through Uniswap. Stablecoins are priced at $1.
  const SUPPORTED_TICKERS = new Set(["ETH", "WETH", "BTC", "WBTC", "UNI", "LINK", "AAVE", "ARB", "OP", "PEPE", "SHIB", "LDO", "ENS", "MKR", "USDC", "USDT", "DAI"]);
  const STABLES = {
    USDC: { name: "USD Coin", color: "#2775CA" },
    USDT: { name: "Tether", color: "#26A17B" },
    DAI: { name: "Dai", color: "#F5AC37" },
  };

  // ---------------------------------------------------------------------------
  // Wallet access. Inside the extension, requests go through bridge.js (page main
  // world). When pasted into the page directly (preview), use window.ethereum.
  // ---------------------------------------------------------------------------
  const inExtension = !!(globalThis.chrome && chrome.runtime && chrome.runtime.id);
  let nextRpcId = 1;
  const pendingRpcs = new Map();

  if (inExtension) {
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.type !== "ephi:bridge-response" || data.blinkId !== BLINK_ID) return;
      const pending = pendingRpcs.get(data.rpcId);
      if (!pending) return;
      pendingRpcs.delete(data.rpcId);
      if (data.error) pending.reject(Object.assign(new Error(data.error.message), { code: data.error.code }));
      else pending.resolve(data.result);
    });
  }

  function walletRequest(method, params) {
    if (!inExtension) {
      if (!window.ethereum) return Promise.reject(new Error("No wallet found. Install MetaMask or another browser wallet."));
      return window.ethereum.request({ method, params });
    }
    return new Promise((resolve, reject) => {
      const rpcId = nextRpcId++;
      pendingRpcs.set(rpcId, { resolve, reject });
      window.postMessage({ type: "ephi:bridge-request", blinkId: BLINK_ID, rpcId, method, params }, window.location.origin);
    });
  }

  let connectedAccount = null;

  // ---------------------------------------------------------------------------
  // Reading X's ticker card
  // ---------------------------------------------------------------------------
  function parseTickerLink(link) {
    const spans = [...link.querySelectorAll("span")].map((span) => ({ span, text: span.textContent.trim() }));
    const price = spans.find((s) => /^\$[\d,]+(\.\d+)?$/.test(s.text));
    const symbol = spans.find((s) => /^[A-Z0-9]{2,10}$/.test(s.text));
    const change = spans.find((s) => /^[+\-−][\d.,]+%$/.test(s.text));
    const name = spans.find((s) => s !== price && s !== symbol && s !== change && s.text && getComputedStyle(s.span).fontWeight >= 700);
    if (!price || !symbol || !link.querySelector("svg")) return null;

    return {
      symbol: symbol.text,
      name: name ? name.text : symbol.text,
      price: parseFloat(price.text.replace(/[$,]/g, "")),
      priceSpan: price.span,
      iconSrc: link.querySelector("img") ? link.querySelector("img").src : null,
      nameSpan: name ? name.span : price.span,
      symbolSpan: symbol.span,
    };
  }

  function readTheme(article, link, ticker) {
    const linkStyle = getComputedStyle(link);
    const cashtag = [...article.querySelectorAll('[data-testid="tweetText"] a')].find((a) => a.textContent.trim().startsWith("$"));
    let bg = "rgb(0, 0, 0)";
    for (let el = link; el; el = el.parentElement) {
      const color = getComputedStyle(el).backgroundColor;
      if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") { bg = color; break; }
    }
    return {
      text: getComputedStyle(ticker.nameSpan).color,
      muted: getComputedStyle(ticker.symbolSpan).color,
      border: linkStyle.borderTopColor,
      bg,
      accent: cashtag ? getComputedStyle(cashtag).color : "rgb(29, 155, 240)",
      font: getComputedStyle(ticker.nameSpan).fontFamily,
    };
  }

  // ---------------------------------------------------------------------------
  // Formatting helpers
  // ---------------------------------------------------------------------------
  function formatAmount(value) {
    if (!isFinite(value) || value <= 0) return "0";
    if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
    return value.toLocaleString("en-US", { maximumSignificantDigits: 4 });
  }

  function formatUsd(value) {
    if (!isFinite(value) || value <= 0) return "$0.00";
    return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function shortAddress(address) {
    return address.slice(0, 6) + "…" + address.slice(-4);
  }

  function tokenIcon(symbol, ticker) {
    if (symbol === ticker.symbol && ticker.iconSrc) return `<img class="icon" src="${ticker.iconSrc}" alt="">`;
    const color = STABLES[symbol] ? STABLES[symbol].color : "#71767b";
    return `<span class="icon" style="background:${color}">${symbol === "DAI" ? "◈" : "$"}</span>`;
  }

  // ---------------------------------------------------------------------------
  // Panel
  // ---------------------------------------------------------------------------
  const STYLE = `
    :host { all: initial; display: block; }
    * { box-sizing: border-box; }
    .panel {
      font-family: var(--font);
      color: var(--text);
      background: var(--bg);
      border: 1px solid var(--border);
      border-top: 0;
      border-radius: 0 0 12px 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      cursor: default;
      -webkit-font-smoothing: antialiased;
    }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .seg { display: inline-flex; border: 1px solid var(--border); border-radius: 9999px; padding: 2px; }
    .seg button {
      font: inherit; font-size: 13px; font-weight: 700; color: var(--muted);
      background: none; border: 0; border-radius: 9999px; padding: 4px 14px; cursor: pointer;
      transition: background-color .15s, color .15s;
    }
    .seg button:hover { color: var(--text); }
    .seg button.on { background: var(--text); color: var(--bg); }
    .via { font-size: 13px; color: var(--muted); white-space: nowrap; }
    .via b { color: var(--text); font-weight: 700; }

    .row { display: flex; align-items: stretch; gap: 8px; flex-wrap: wrap; position: relative; }
    .box {
      flex: 1 1 170px; min-width: 0;
      background: var(--surface);
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 10px 12px;
      display: flex; flex-direction: column; gap: 4px;
      transition: border-color .15s;
    }
    .box.pay:focus-within { border-color: var(--accent); }
    /* Leave room for the round switch button that sits between the two boxes */
    .box.pay { padding-right: 22px; }
    .box.get { padding-left: 22px; }
    .lbl, .sub { font-size: 13px; color: var(--muted); line-height: 16px; }
    .line { display: flex; align-items: center; gap: 8px; min-height: 28px; }
    .line input, .line .out {
      flex: 1; min-width: 0;
      font: inherit; font-size: 20px; font-weight: 700; line-height: 24px;
      color: var(--text); background: none; border: 0; outline: none; padding: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .line input::placeholder { color: var(--muted); }
    .out.empty { color: var(--muted); }

    .chip {
      display: inline-flex; align-items: center; gap: 6px; flex: none;
      font: inherit; font-size: 15px; font-weight: 700; color: var(--text);
      background: var(--bg); border: 1px solid var(--border); border-radius: 9999px;
      padding: 3px 10px 3px 4px; height: 30px;
    }
    button.chip { cursor: pointer; }
    button.chip:hover { background: var(--hover); }
    .chip .caret { width: 14px; height: 14px; fill: var(--muted); margin-left: -2px; }
    .icon {
      width: 22px; height: 22px; border-radius: 50%; flex: none;
      display: inline-flex; align-items: center; justify-content: center;
      color: #fff; font-size: 12px; font-weight: 700; object-fit: cover;
    }

    .flip {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 30px; height: 30px; border-radius: 50%;
      background: var(--bg); border: 1px solid var(--border); color: var(--text);
      display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1;
      transition: background-color .15s;
    }
    .flip:hover { background: var(--hover); }
    .flip svg { width: 16px; height: 16px; fill: currentColor; transform: rotate(-90deg); }
    @container (max-width: 360px) {
      .flip svg { transform: none; }
      .box.pay { padding-right: 12px; }
      .box.get { padding-left: 12px; }
    }

    .menu {
      position: absolute; z-index: 2; min-width: 180px;
      background: var(--bg); border: 1px solid var(--border); border-radius: 12px;
      box-shadow: 0 0 15px var(--shadow), 0 0 3px 1px var(--shadow);
      padding: 4px 0; overflow: hidden;
    }
    .menu button {
      display: flex; align-items: center; gap: 10px; width: 100%;
      font: inherit; font-size: 15px; font-weight: 700; color: var(--text);
      background: none; border: 0; padding: 8px 14px; cursor: pointer; text-align: left;
    }
    .menu button:hover { background: var(--hover); }
    .menu small { font-size: 13px; font-weight: 400; color: var(--muted); margin-left: 6px; }

    .foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .rate { font-size: 13px; color: var(--muted); }
    .cta {
      font: inherit; font-size: 15px; font-weight: 700;
      color: var(--bg); background: var(--text);
      border: 0; border-radius: 9999px; height: 36px; padding: 0 20px; cursor: pointer;
      transition: opacity .15s;
    }
    .cta:hover { opacity: .9; }
    .cta:disabled { opacity: .5; cursor: default; }
    .status { font-size: 13px; color: var(--muted); }
    .status.error { color: rgb(244, 33, 46); }
    .status.ok { color: rgb(0, 186, 124); }
    .wrap { container-type: inline-size; }
  `;

  const CARET_SVG = `<svg class="caret" viewBox="0 0 24 24"><path d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"/></svg>`;
  const ARROW_SVG = `<svg viewBox="0 0 24 24"><path d="M13 3v13.59l5.043-5.05 1.414 1.42L12 20.41l-7.457-7.45 1.414-1.42L11 16.59V3h2z"/></svg>`;

  function createPanel(article, link, ticker) {
    const theme = readTheme(article, link, ticker);
    const host = document.createElement("div");
    host.setAttribute(HOST_ATTR, ticker.symbol);
    const root = host.attachShadow({ mode: "open" });

    const isStable = !!STABLES[ticker.symbol];
    const quoteTokens = Object.keys(STABLES).filter((s) => s !== ticker.symbol);
    const state = { side: "buy", quote: quoteTokens[0], amount: "" };

    root.innerHTML = `
      <style>${STYLE}</style>
      <div class="wrap">
        <div class="panel">
          <div class="head">
            <div class="seg" role="tablist">
              <button data-side="buy" class="on">Buy</button>
              <button data-side="sell">Sell</button>
            </div>
            <div class="via">Swap on <b>Uniswap</b></div>
          </div>
          <div class="row">
            <label class="box pay">
              <span class="lbl">You pay</span>
              <div class="line">
                <input class="amount" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Amount to pay">
                <span class="pay-token"></span>
              </div>
              <span class="sub pay-usd">$0.00</span>
            </label>
            <button class="flip" title="Switch buy/sell" aria-label="Switch buy and sell">${ARROW_SVG}</button>
            <div class="box get">
              <span class="lbl">You receive</span>
              <div class="line">
                <span class="out empty">0</span>
                <span class="get-token"></span>
              </div>
              <span class="sub get-usd">$0.00</span>
            </div>
          </div>
          <div class="foot">
            <span class="rate"></span>
            <button class="cta"></button>
          </div>
          <div class="status" hidden></div>
        </div>
      </div>`;

    const $ = (selector) => root.querySelector(selector);
    // Set via setProperty: X's font stack contains double quotes, which would break an inline style attribute
    const themeVars = {
      "--text": theme.text, "--muted": theme.muted, "--border": theme.border, "--bg": theme.bg,
      "--accent": theme.accent, "--font": theme.font,
      "--surface": `color-mix(in srgb, ${theme.text} 6%, transparent)`,
      "--hover": `color-mix(in srgb, ${theme.text} 8%, ${theme.bg})`,
      "--shadow": `color-mix(in srgb, ${theme.text} 20%, transparent)`,
    };
    Object.entries(themeVars).forEach(([name, value]) => $(".panel").style.setProperty(name, value));
    const input = $(".amount");
    const status = $(".status");

    function payToken() { return state.side === "buy" ? state.quote : ticker.symbol; }
    function getToken() { return state.side === "buy" ? ticker.symbol : state.quote; }
    // X streams price updates into the card, so always read the current value from it
    function tickerPrice() {
      if (!ticker.priceSpan.isConnected) {
        const fresh = parseTickerLink(link);
        if (fresh) ticker.priceSpan = fresh.priceSpan;
      }
      const live = parseFloat(ticker.priceSpan.textContent.replace(/[$,]/g, ""));
      if (isFinite(live) && live > 0) ticker.price = live;
      return ticker.price;
    }
    function usdPrice(symbol) { return STABLES[symbol] ? 1 : tickerPrice(); }
    function received() {
      const amount = parseFloat(state.amount);
      return amount > 0 ? (amount * usdPrice(payToken())) / usdPrice(getToken()) : 0;
    }
    // Switching sides keeps the trade the same size: what you'd receive becomes what you pay
    function setSide(side) {
      if (side === state.side) return;
      const out = received();
      state.side = side;
      state.amount = out > 0 ? String(parseFloat(out.toPrecision(6))) : "";
      input.value = state.amount;
    }

    function chipHtml(symbol, selectable) {
      const tag = selectable ? "button" : "span";
      return `<${tag} class="chip"${selectable ? ' aria-haspopup="menu"' : ""}>${tokenIcon(symbol, ticker)}${symbol}${selectable ? CARET_SVG : ""}</${tag}>`;
    }

    function setStatus(text, kind) {
      status.hidden = !text;
      status.textContent = text || "";
      status.className = "status" + (kind ? " " + kind : "");
    }

    function render() {
      root.querySelectorAll(".seg button").forEach((b) => b.classList.toggle("on", b.dataset.side === state.side));
      // The stablecoin side is selectable; the ticker side is fixed to the card's token.
      $(".pay-token").innerHTML = chipHtml(payToken(), state.side === "buy" && !isStable);
      $(".get-token").innerHTML = chipHtml(getToken(), state.side === "sell" && !isStable);

      const amount = parseFloat(state.amount);
      const payUsd = amount * usdPrice(payToken());
      const out = $(".out");
      out.textContent = amount > 0 ? formatAmount(received()) : "0";
      out.classList.toggle("empty", !(amount > 0));
      // Shrink long numbers so they fit next to the token chip
      out.style.fontSize = out.textContent.length > 9 ? "16px" : "";
      input.style.fontSize = input.value.length > 9 ? "16px" : "";
      $(".pay-usd").textContent = formatUsd(payUsd);
      $(".get-usd").textContent = formatUsd(received() * usdPrice(getToken()));
      $(".rate").textContent = `1 ${ticker.symbol} ≈ ${formatAmount(tickerPrice())} ${state.quote}`;

      const cta = $(".cta");
      const verb = state.side === "buy" ? "Buy" : "Sell";
      if (!connectedAccount) {
        cta.textContent = "Connect wallet";
        cta.disabled = false;
      } else {
        cta.textContent = amount > 0 ? `${verb} ${ticker.symbol}` : "Enter an amount";
        cta.disabled = !(amount > 0);
      }
    }

    function closeMenu() {
      const menu = $(".menu");
      if (menu) menu.remove();
    }

    function openTokenMenu(anchor) {
      closeMenu();
      const menu = document.createElement("div");
      menu.className = "menu";
      menu.setAttribute("role", "menu");
      menu.innerHTML = quoteTokens.map((s) => `<button data-token="${s}" role="menuitem">${tokenIcon(s, ticker)}<span>${s}<small>${STABLES[s].name}</small></span></button>`).join("");
      const row = $(".row");
      const anchorRect = anchor.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      // Open upward, over the ticker card: below the panel it would be hidden behind the next tweet
      menu.style.bottom = `${rowRect.bottom - anchorRect.top + 4}px`;
      menu.style.right = `${rowRect.right - anchorRect.right}px`;
      row.appendChild(menu);
      menu.addEventListener("click", (event) => {
        const item = event.target.closest("[data-token]");
        if (!item) return;
        state.quote = item.dataset.token;
        closeMenu();
        render();
      });
    }

    async function onCta() {
      if (!connectedAccount) {
        setStatus("Check your wallet to connect…");
        try {
          const accounts = await walletRequest("eth_requestAccounts");
          connectedAccount = accounts && accounts[0];
          setStatus(connectedAccount ? `Connected ${shortAddress(connectedAccount)}` : "", connectedAccount ? "ok" : "");
          // Update every panel on the page
          document.querySelectorAll(`[${HOST_ATTR}]`).forEach((h) => h.dispatchEvent(new Event("ephi:refresh")));
        } catch (error) {
          setStatus(error.message, "error");
        }
        return;
      }
      // Quote preview only: the on-chain Uniswap swap is wired in the next step.
      setStatus(`Quote preview: ${state.side === "buy" ? "buying" : "selling"} ${ticker.symbol} on Uniswap is not wired up yet.`);
    }

    // Keep X from treating clicks/keys inside the panel as tweet clicks or keyboard shortcuts
    ["click", "mousedown", "mouseup", "pointerdown", "pointerup", "keydown", "keyup", "keypress", "touchstart", "touchend"].forEach((type) =>
      host.addEventListener(type, (event) => event.stopPropagation())
    );

    root.addEventListener("click", (event) => {
      const target = event.target;
      const sideButton = target.closest(".seg button");
      if (sideButton) { setSide(sideButton.dataset.side); closeMenu(); render(); return; }
      if (target.closest(".flip")) { setSide(state.side === "buy" ? "sell" : "buy"); closeMenu(); render(); return; }
      const chip = target.closest("button.chip");
      if (chip) { event.preventDefault(); $(".menu") ? closeMenu() : openTokenMenu(chip); return; }
      if (target.closest(".cta")) { onCta(); return; }
      if (!target.closest(".menu")) closeMenu();
    });

    input.addEventListener("input", () => {
      // Allow only a positive decimal number
      let value = input.value.replace(/,/g, ".").replace(/[^\d.]/g, "");
      const dot = value.indexOf(".");
      if (dot !== -1) value = value.slice(0, dot + 1) + value.slice(dot + 1).replace(/\./g, "");
      if (value !== input.value) input.value = value;
      state.amount = value;
      render();
    });

    host.addEventListener("ephi:refresh", render);
    new MutationObserver(render).observe(link, { childList: true, characterData: true, subtree: true });
    render();
    return host;
  }

  // ---------------------------------------------------------------------------
  // Finding ticker cards in the timeline (X re-renders tweets, so keep scanning)
  // ---------------------------------------------------------------------------
  function attachToCard(article, list) {
    // The card container is the element wrapping X's ScrollSnap carousel <nav>
    const nav = list.closest("nav");
    const container = nav && nav.parentElement;
    if (!container || container.nextElementSibling?.hasAttribute(HOST_ATTR)) return;

    const links = [...list.querySelectorAll('a[role="link"]')];
    for (const link of links) {
      const ticker = parseTickerLink(link);
      if (!ticker || !SUPPORTED_TICKERS.has(ticker.symbol)) continue;

      const host = createPanel(article, link, ticker);
      // Join the panel to the card: square off the card's bottom corners
      link.style.borderBottomLeftRadius = "0";
      link.style.borderBottomRightRadius = "0";
      container.after(host);

      const align = () => {
        const containerRect = container.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        host.style.width = `${linkRect.width}px`;
        host.style.marginLeft = `${linkRect.left - containerRect.left}px`;
      };
      align();
      new ResizeObserver(align).observe(link);
      return; // One panel per card, for the first supported ticker
    }
  }

  function scan() {
    document.querySelectorAll('article[data-testid="tweet"]').forEach((article) => {
      article.querySelectorAll('[data-testid="ScrollSnap-List"]').forEach((list) => attachToCard(article, list));
    });
  }

  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; scan(); });
  }).observe(document.body, { childList: true, subtree: true });
  scan();
})();
