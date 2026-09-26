// Uniswap blink for X ticker cards.
// X renders a ticker card (icon, name, price, change, sparkline) for cashtags like $ETH.
// This script adds a "Buy" button inside supported cards. Pressing it expands a swap panel,
// styled as part of the card, that quotes and executes the swap through the Uniswap Trading
// API (proxied by blink-back-end so the API key stays server-side) on the selected network.
(() => {
  const BLINK_ID = "x-ticker-swap";
  const HOST_ATTR = "data-ephi-ticker-swap";

  // ---------------------------------------------------------------------------
  // Networks and tokens. Every address and its decimals were verified on-chain,
  // and every token was checked to have a Uniswap route from USDC.
  // ---------------------------------------------------------------------------
  const CHAINS = {
    8453: { name: "Base", hex: "0x2105", icon: "base", explorer: "https://basescan.org", explorerName: "BaseScan", rpc: "https://mainnet.base.org", gasReserveWei: 200000000000000n },
    1: { name: "Ethereum", hex: "0x1", icon: "ethereum", explorer: "https://etherscan.io", explorerName: "Etherscan", rpc: "https://ethereum-rpc.publicnode.com", gasReserveWei: 3000000000000000n },
    42161: { name: "Arbitrum", hex: "0xa4b1", icon: "arbitrum", explorer: "https://arbiscan.io", explorerName: "Arbiscan", rpc: "https://arb1.arbitrum.io/rpc", gasReserveWei: 200000000000000n },
    10: { name: "Optimism", hex: "0xa", icon: "optimism", explorer: "https://optimistic.etherscan.io", explorerName: "Etherscan", rpc: "https://mainnet.optimism.io", gasReserveWei: 200000000000000n },
    130: { name: "Unichain", hex: "0x82", icon: "unichain", explorer: "https://uniscan.xyz", explorerName: "Uniscan", rpc: "https://mainnet.unichain.org", gasReserveWei: 200000000000000n },
  };
  const CHAIN_ORDER = [8453, 1, 42161, 10, 130];
  const DEFAULT_CHAIN = 8453;
  const NATIVE = "0x0000000000000000000000000000000000000000";

  const TOKEN_INFO = {
    ETH: { name: "Ether", color: "#627EEA" },
    WETH: { name: "Wrapped Ether", color: "#627EEA" },
    USDC: { name: "USD Coin", color: "#2775CA", stable: true },
    USDT: { name: "Tether", color: "#26A17B", stable: true },
    DAI: { name: "Dai", color: "#F5AC37", stable: true },
    WBTC: { name: "Wrapped BTC", color: "#F7931A" },
    cbBTC: { name: "Coinbase Wrapped BTC", color: "#F7931A" },
    UNI: { name: "Uniswap", color: "#FF007A" },
    LINK: { name: "Chainlink", color: "#2A5ADA" },
    AAVE: { name: "Aave", color: "#B6509E" },
    wstETH: { name: "Wrapped stETH", color: "#00A3FF" },
    cbETH: { name: "Coinbase Wrapped ETH", color: "#0052FF" },
    MORPHO: { name: "Morpho", color: "#2470FF" },
    DEGEN: { name: "Degen", color: "#A36EFD" },
    BRETT: { name: "Brett", color: "#01A7F6" },
    AERO: { name: "Aerodrome", color: "#0433FF" },
    VIRTUAL: { name: "Virtuals Protocol", color: "#34D3D3" },
    TOSHI: { name: "Toshi", color: "#1E6FFF" },
    ZORA: { name: "Zora", color: "#000000" },
    PEPE: { name: "Pepe", color: "#3D8130" },
    SHIB: { name: "Shiba Inu", color: "#E42D04" },
    LDO: { name: "Lido DAO", color: "#F69988" },
    ENS: { name: "ENS", color: "#5298FF" },
    ONDO: { name: "Ondo", color: "#0F1F3D" },
    ARB: { name: "Arbitrum", color: "#28A0F0" },
    OP: { name: "Optimism", color: "#FF0420" },
    PENDLE: { name: "Pendle", color: "#1BE3C2" },
    GMX: { name: "GMX", color: "#2D42FC" },
    VELO: { name: "Velodrome", color: "#FF1100" },
  };

  // [address, decimals] per network
  const TOKEN_ADDRESSES = {
    8453: {
      ETH: [NATIVE, 18],
      WETH: ["0x4200000000000000000000000000000000000006", 18],
      USDC: ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 6],
      USDT: ["0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", 6],
      DAI: ["0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", 18],
      cbBTC: ["0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", 8],
      UNI: ["0xc3De830EA07524a0761646a6a4e4be0e114a3C83", 18],
      LINK: ["0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196", 18],
      AAVE: ["0x63706e401c06ac8513145b7687A14804d17f814b", 18],
      DEGEN: ["0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", 18],
      BRETT: ["0x532f27101965dd16442E59d40670FaF5eBB142E4", 18],
      AERO: ["0x940181a94A35A4569E4529A3CDfB74e38FD98631", 18],
      VIRTUAL: ["0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b", 18],
      TOSHI: ["0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4", 18],
      ZORA: ["0x1111111111166b7FE7bd91427724B487980aFc69", 18],
      wstETH: ["0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", 18],
      cbETH: ["0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", 18],
      MORPHO: ["0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842", 18],
    },
    1: {
      ETH: [NATIVE, 18],
      WETH: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18],
      USDC: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6],
      USDT: ["0xdAC17F958D2ee523a2206206994597C13D831ec7", 6],
      DAI: ["0x6B175474E89094C44Da98b954EedeAC495271d0F", 18],
      WBTC: ["0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", 8],
      cbBTC: ["0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", 8],
      UNI: ["0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", 18],
      LINK: ["0x514910771AF9Ca656af840dff83E8264EcF986CA", 18],
      AAVE: ["0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", 18],
      wstETH: ["0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", 18],
      cbETH: ["0xBe9895146f7AF43049ca1c1AE358B0541Ea49704", 18],
      MORPHO: ["0x58D97B57BB95320F9a05dC918Aef65434969c2B2", 18],
      PEPE: ["0x6982508145454Ce325dDbE47a25d4ec3d2311933", 18],
      SHIB: ["0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", 18],
      LDO: ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", 18],
      ENS: ["0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", 18],
      ONDO: ["0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3", 18],
      ARB: ["0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", 18],
    },
    42161: {
      ETH: [NATIVE, 18],
      WETH: ["0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18],
      USDC: ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831", 6],
      USDT: ["0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", 6],
      DAI: ["0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
      WBTC: ["0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", 8],
      UNI: ["0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0", 18],
      LINK: ["0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", 18],
      AAVE: ["0xba5DdD1f9d7F570dc94a51479a000E3BCE967196", 18],
      ARB: ["0x912CE59144191C1204E64559FE8253a0e49E6548", 18],
      PENDLE: ["0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8", 18],
      GMX: ["0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", 18],
      wstETH: ["0x5979D7b546E38E414F7E9822514be443A4800529", 18],
    },
    10: {
      ETH: [NATIVE, 18],
      WETH: ["0x4200000000000000000000000000000000000006", 18],
      USDC: ["0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", 6],
      USDT: ["0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", 6],
      DAI: ["0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
      WBTC: ["0x68f180fcCe6836688e9084f035309E29Bf0A2095", 8],
      OP: ["0x4200000000000000000000000000000000000042", 18],
      LINK: ["0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6", 18],
      UNI: ["0x6fd9d7AD17242c41f7131d257212c54A0e816691", 18],
      AAVE: ["0x76FB31fb4af56892A25e32cFC43De717950c9278", 18],
      wstETH: ["0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb", 18],
      VELO: ["0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db", 18],
    },
    130: {
      ETH: [NATIVE, 18],
      WETH: ["0x4200000000000000000000000000000000000006", 18],
      USDC: ["0x078D782b760474a361dDA0AF3839290b0EF57AD6", 6],
      DAI: ["0x20CAb320A855b39F724131C69424240519573f81", 18],
      WBTC: ["0x927B51f251480a681271180DA4de28D44EC4AfB8", 8],
      UNI: ["0x8f187aA05619a017077f5308904739877ce9eA21", 18],
      wstETH: ["0xc02fE7317D4eb8753a02c35fe019786854A92001", 18],
    },
  };

  // X cashtag -> token symbols to use, in order of preference (e.g. $BTC is cbBTC on Base, WBTC elsewhere)
  const TICKER_TO_TOKENS = {
    ETH: ["ETH"], WETH: ["WETH"], BTC: ["cbBTC", "WBTC"], WBTC: ["WBTC"], CBBTC: ["cbBTC"],
    USDC: ["USDC"], USDT: ["USDT"], DAI: ["DAI"], UNI: ["UNI"], LINK: ["LINK"], AAVE: ["AAVE"],
    WSTETH: ["wstETH"], CBETH: ["cbETH"], MORPHO: ["MORPHO"], DEGEN: ["DEGEN"], BRETT: ["BRETT"],
    AERO: ["AERO"], VIRTUAL: ["VIRTUAL"], TOSHI: ["TOSHI"], ZORA: ["ZORA"], PEPE: ["PEPE"], SHIB: ["SHIB"],
    LDO: ["LDO"], ENS: ["ENS"], ONDO: ["ONDO"], ARB: ["ARB"], OP: ["OP"], PENDLE: ["PENDLE"], GMX: ["GMX"], VELO: ["VELO"],
  };
  const QUOTE_TOKENS = ["USDC", "ETH", "USDT"];
  // Used as the swapper for quotes before a wallet is connected
  const PREVIEW_SWAPPER = "0x1111111111111111111111111111111111111111";

  function tokenOn(chainId, symbol) {
    const entry = TOKEN_ADDRESSES[chainId] && TOKEN_ADDRESSES[chainId][symbol];
    return entry ? { address: entry[0], decimals: entry[1] } : null;
  }
  function tokenForTicker(ticker, chainId) {
    return (TICKER_TO_TOKENS[ticker] || []).find((symbol) => tokenOn(chainId, symbol)) || null;
  }
  function chainsForTicker(ticker) {
    return CHAIN_ORDER.filter((chainId) => tokenForTicker(ticker, chainId));
  }

  // ---------------------------------------------------------------------------
  // Wallet access. Inside the extension, requests go through bridge.js (page main
  // world, where the wallet lives). Outside it (pasted as a preview), use window.ethereum.
  // ---------------------------------------------------------------------------
  const inExtension = !!(globalThis.chrome && chrome.runtime && chrome.runtime.id);
  let nextRpcId = 1;
  const pendingRpcs = new Map();
  const wallet = { account: null, chainId: null }; // chainId as a number

  function refreshAllPanels() {
    document.querySelectorAll(`[${HOST_ATTR}]`).forEach((host) => host.dispatchEvent(new Event("ephi:wallet")));
  }

  if (inExtension) {
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data) return;
      if (data.type === "ephi:bridge-response" && data.blinkId === BLINK_ID) {
        const pending = pendingRpcs.get(data.rpcId);
        if (!pending) return;
        pendingRpcs.delete(data.rpcId);
        if (data.error) pending.reject(Object.assign(new Error(data.error.message), { code: data.error.code }));
        else pending.resolve(data.result);
      } else if (data.type === "ephi:bridge-event") {
        if (data.event === "accountsChanged") wallet.account = (data.payload && data.payload[0]) || null;
        if (data.event === "chainChanged") wallet.chainId = parseInt(data.payload, 16);
        refreshAllPanels();
      }
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

  async function connectWallet() {
    const accounts = await walletRequest("eth_requestAccounts");
    wallet.account = accounts[0];
    wallet.chainId = parseInt(await walletRequest("eth_chainId"), 16);
    refreshAllPanels();
  }

  async function ensureChain(chainId) {
    wallet.chainId = parseInt(await walletRequest("eth_chainId"), 16);
    if (wallet.chainId === chainId) return;
    const chain = CHAINS[chainId];
    try {
      await walletRequest("wallet_switchEthereumChain", [{ chainId: chain.hex }]);
    } catch (error) {
      if (error.code !== 4902) throw error; // 4902: network not added to the wallet yet
      await walletRequest("wallet_addEthereumChain", [{
        chainId: chain.hex,
        chainName: chain.name,
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: [chain.rpc],
        blockExplorerUrls: [chain.explorer],
      }]);
    }
    wallet.chainId = chainId;
    refreshAllPanels();
  }

  async function waitForReceipt(hash) {
    for (let i = 0; i < 200; i++) {
      const receipt = await walletRequest("eth_getTransactionReceipt", [hash]);
      if (receipt && receipt.blockNumber) {
        if (receipt.status !== "0x1") throw new Error("Transaction reverted on-chain");
        return receipt;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    throw new Error("Timed out waiting for the transaction to confirm");
  }

  function toHexQuantity(value) {
    return "0x" + BigInt(value || 0).toString(16);
  }

  async function sendTransaction(tx) {
    if (!tx || !tx.data || tx.data === "0x") throw new Error("Uniswap returned an empty transaction");
    const params = { from: wallet.account, to: tx.to, data: tx.data, value: toHexQuantity(tx.value) };

    // The API's gasLimit leaves little headroom: if other trades in the same block move the pool,
    // the swap crosses more ticks and runs out of gas (surfacing as TRANSFER_FROM_FAILED).
    // Use the larger of our own estimate and the API's, plus 30%. Only gas used is paid for.
    let gas = tx.gasLimit ? BigInt(tx.gasLimit) : 0n;
    try {
      const estimate = BigInt(await walletRequest("eth_estimateGas", [params]));
      if (estimate > gas) gas = estimate;
    } catch (error) {
      // Estimation simulates the transaction: failing here means it would revert on-chain
      throw new Error(`Transaction would fail: ${error.message.replace(/^.*execution reverted:?\s*/i, "") || "reverted in simulation"}`);
    }
    params.gas = toHexQuantity((gas * 13n) / 10n);
    return walletRequest("eth_sendTransaction", [params]);
  }

  async function tokenBalance(chainId, symbol) {
    const token = tokenOn(chainId, symbol);
    if (token.address === NATIVE) return BigInt(await walletRequest("eth_getBalance", [wallet.account, "latest"]));
    const data = "0x70a08231" + wallet.account.slice(2).toLowerCase().padStart(64, "0"); // balanceOf(address)
    const result = await walletRequest("eth_call", [{ to: token.address, data }, "latest"]);
    return BigInt(result && result !== "0x" ? result : 0);
  }

  // Restore an existing connection without prompting
  walletRequest("eth_accounts")
    .then(async (accounts) => {
      if (accounts && accounts[0]) {
        wallet.account = accounts[0];
        wallet.chainId = parseInt(await walletRequest("eth_chainId"), 16);
        refreshAllPanels();
      }
    })
    .catch(() => {});

  // ---------------------------------------------------------------------------
  // Uniswap Trading API (via the extension background -> blink-back-end proxy)
  // ---------------------------------------------------------------------------
  function uniswapApi(endpoint, body) {
    if (!inExtension) return Promise.reject(new Error("Live quotes need the Ephi extension"));
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "uniswap", endpoint, body }, (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!response.ok) {
          const body = response.body || {};
          const message = body.errorCode === "NoRouteFoundError" || body.errorCode === "NoQuotesAvailable"
            ? "No Uniswap route for this pair"
            : body.detail || body.message || body.error || `Uniswap API error ${response.status}`;
          return reject(Object.assign(new Error(message), { status: response.status, errorCode: body.errorCode }));
        }
        resolve(response.body);
      });
    });
  }

  function quoteRequest(chainId, tokenIn, tokenOut, amount, swapper) {
    return {
      type: "EXACT_INPUT",
      amount,
      tokenInChainId: chainId,
      tokenOutChainId: chainId,
      tokenIn: tokenOn(chainId, tokenIn).address,
      tokenOut: tokenOn(chainId, tokenOut).address,
      swapper,
      protocols: ["V2", "V3", "V4"], // classic AMM swap (a single wallet transaction)
      routingPreference: "BEST_PRICE",
      autoSlippage: "DEFAULT",
    };
  }

  // EIP-712 payload for eth_signTypedData_v4 from the API's permitData
  function typedDataFromPermit(permitData) {
    const domainFields = [
      ["name", "string"], ["version", "string"], ["chainId", "uint256"], ["verifyingContract", "address"], ["salt", "bytes32"],
    ].filter(([key]) => permitData.domain[key] !== undefined).map(([name, type]) => ({ name, type }));
    const types = { EIP712Domain: domainFields, ...permitData.types };
    const referenced = new Set(Object.values(permitData.types).flat().map((field) => field.type.replace(/\[\]$/, "")));
    const primaryType = Object.keys(permitData.types).find((name) => !referenced.has(name));
    return JSON.stringify({ types, domain: permitData.domain, primaryType, message: permitData.values });
  }

  // ---------------------------------------------------------------------------
  // Intercepta security checks (via the extension background -> blink-back-end proxy)
  // ---------------------------------------------------------------------------
  // Chains Intercepta can simulate transactions on (Unichain isn't supported yet)
  const TX_SCAN_CHAINS = new Set([1, 10, 8453, 42161]);
  // Detectors that vouch for a token rather than warn about it
  const POSITIVE_DETECTORS = new Set(["HIGH_REPUTATION_TOKEN"]);
  const tokenRiskCache = new Map(); // `${chainId}:${address}` -> Promise of the verdict

  function interceptaApi(message) {
    if (!inExtension) return Promise.reject(new Error("Security checks need the Ephi extension"));
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "intercepta", ...message }, (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!response.ok) {
          const body = response.body || {};
          return reject(Object.assign(new Error(body.message || body.error || `Intercepta API error ${response.status}`), { status: response.status }));
        }
        resolve(response.body);
      });
    });
  }

  function detectorReasons(detectors) {
    return (detectors || []).filter((d) => !POSITIVE_DETECTORS.has(d.code)).map((d) => d.description || d.code);
  }

  // -> { action: "block" | "warn" | "info", reasons: [description] }
  function tokenRisk(chainId, address) {
    const key = `${chainId}:${address.toLowerCase()}`;
    if (!tokenRiskCache.has(key)) {
      const request = interceptaApi({ check: "token", chainId, address }).then((body) => ({
        action: body.action === "block" || body.action === "warn" ? body.action : "info",
        reasons: detectorReasons(body.detectors),
      }));
      request.catch(() => tokenRiskCache.delete(key)); // don't cache failures, so the next open retries
      tokenRiskCache.set(key, request);
    }
    return tokenRiskCache.get(key);
  }

  // Simulates a transaction before it's signed -> { reasons, send, receive }, or null if the chain isn't supported
  async function scanTransaction(chainId, tx) {
    if (!TX_SCAN_CHAINS.has(chainId)) return null;
    const body = await interceptaApi({
      check: "transaction",
      chainId,
      body: { transaction: { from: wallet.account, to: tx.to, data: tx.data, value: toHexQuantity(tx.value) } },
    });
    const movement = body.assetsMovement || {};
    return { reasons: detectorReasons(body.detectors), send: movement.send || [], receive: movement.receive || [] };
  }

  // ---------------------------------------------------------------------------
  // Units and formatting
  // ---------------------------------------------------------------------------
  function parseUnits(value, decimals) {
    const [whole, fraction = ""] = String(value).split(".");
    const padded = (fraction + "0".repeat(decimals)).slice(0, decimals);
    return BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(padded || "0");
  }

  function unitsToNumber(amount, decimals) {
    const base = 10n ** BigInt(decimals);
    const value = BigInt(amount);
    return Number(value / base) + Number(value % base) / Number(base);
  }

  function unitsToInput(amount, decimals) {
    const base = 10n ** BigInt(decimals);
    const value = BigInt(amount);
    const fraction = (value % base).toString().padStart(decimals, "0").slice(0, 6).replace(/0+$/, "");
    return (value / base).toString() + (fraction ? "." + fraction : "");
  }

  function formatAmount(value) {
    if (!isFinite(value) || value <= 0) return "0";
    if (value >= 100000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (value >= 100) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
    return value.toLocaleString("en-US", { maximumSignificantDigits: 4 });
  }

  function formatUsd(value) {
    if (!isFinite(value) || value <= 0) return "$0.00";
    if (value < 0.01) return "<$0.01";
    return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function shortAddress(address) {
    return address.slice(0, 6) + "…" + address.slice(-4);
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------------------------------------------------------------------------
  // Icons (bundled with the extension: X's CSP could block remote images)
  // ---------------------------------------------------------------------------
  const TOKEN_LOGOS = new Set([
    "ETH", "WETH", "USDC", "USDT", "DAI", "WBTC", "UNI", "LINK", "AAVE", "wstETH", "cbETH", "MORPHO", "DEGEN", "BRETT",
    "AERO", "VIRTUAL", "TOSHI", "PEPE", "SHIB", "LDO", "ENS", "ONDO", "ARB", "OP", "PENDLE", "GMX", "VELO",
  ]);

  function assetUrl(path) {
    return inExtension ? chrome.runtime.getURL(path) : null;
  }

  function tokenLogoHtml(symbol, className = "icon") {
    const url = TOKEN_LOGOS.has(symbol) && assetUrl(`icons/tokens/${symbol}.png`);
    if (url) return `<img class="${className}" src="${url}" alt="">`;
    const info = TOKEN_INFO[symbol];
    const label = symbol === "ETH" ? "Ξ" : info.stable ? "$" : symbol.replace(/^cb/, "").slice(0, 1);
    return `<span class="${className}" style="background:${info.color}">${label}</span>`;
  }

  function chainLogoHtml(chainId, className = "chain-icon") {
    const url = assetUrl(`icons/chains/${CHAINS[chainId].icon}.png`);
    return url ? `<img class="${className}" src="${url}" alt="${CHAINS[chainId].name}">` : `<span class="${className}"></span>`;
  }

  // ---------------------------------------------------------------------------
  // Reading X's ticker card
  // ---------------------------------------------------------------------------
  function parseTickerLink(link) {
    const spans = [...link.querySelectorAll("span")].map((span) => ({ span, text: span.textContent.trim() }));
    const price = spans.find((s) => /^\$[\d,]+(\.\d+)?$/.test(s.text));
    const symbol = spans.find((s) => /^[A-Za-z0-9]{2,10}$/.test(s.text) && s.text === s.text.toUpperCase());
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
    const cashtag = [...article.querySelectorAll('[data-testid="tweetText"] a')].find((a) => a.textContent.trim().startsWith("$"));
    let bg = "rgb(0, 0, 0)";
    for (let el = link; el; el = el.parentElement) {
      const color = getComputedStyle(el).backgroundColor;
      if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") { bg = color; break; }
    }
    const text = getComputedStyle(ticker.nameSpan).color;
    return {
      "--text": text,
      "--muted": getComputedStyle(ticker.symbolSpan).color,
      "--border": getComputedStyle(link).borderTopColor,
      "--bg": bg,
      "--accent": cashtag ? getComputedStyle(cashtag).color : "rgb(29, 155, 240)",
      "--font": getComputedStyle(ticker.nameSpan).fontFamily,
      "--surface": `color-mix(in srgb, ${text} 6%, transparent)`,
      "--hover": `color-mix(in srgb, ${text} 8%, ${bg})`,
      "--shadow": `color-mix(in srgb, ${text} 20%, transparent)`,
    };
  }

  // Set via setProperty: X's font stack contains double quotes, which would break an inline style attribute
  function applyTheme(element, themeVars) {
    Object.entries(themeVars).forEach(([name, value]) => element.style.setProperty(name, value));
  }

  // ---------------------------------------------------------------------------
  // Dropdown (tokens, networks). Rendered as a fixed layer on <body>, like X's own
  // menus: inside the tweet it would be clipped by the panel and covered by the next tweet.
  // ---------------------------------------------------------------------------
  const DROPDOWN_STYLE = `
    :host { all: initial; position: fixed; z-index: 2147483000; }
    .menu {
      font-family: var(--font); -webkit-font-smoothing: antialiased;
      min-width: 220px; padding: 4px 0; overflow: hidden;
      background: var(--bg); border-radius: 12px;
      box-shadow: 0 0 15px var(--shadow), 0 0 3px 1px var(--shadow);
      animation: drop .12s ease-out;
    }
    @keyframes drop { from { opacity: 0; transform: translateY(-4px); } }
    .title { font-size: 13px; font-weight: 700; color: var(--muted); padding: 10px 16px 6px; }
    .menu button {
      display: flex; align-items: center; gap: 12px; width: 100%;
      font: inherit; color: var(--text); background: none; border: 0;
      padding: 10px 16px; cursor: pointer; text-align: left;
    }
    .menu button:hover:not(:disabled), .menu button:focus-visible { background: var(--hover); outline: none; }
    .menu button:disabled { cursor: default; opacity: .45; }
    .names { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .names b { font-size: 15px; font-weight: 700; line-height: 20px; }
    .names small { font-size: 13px; color: var(--muted); line-height: 16px; }
    .check { width: 18px; height: 18px; fill: var(--accent); flex: none; }
    .icon {
      width: 32px; height: 32px; border-radius: 50%; flex: none; object-fit: cover;
      display: inline-flex; align-items: center; justify-content: center;
      color: #fff; font-size: 14px; font-weight: 700;
    }
    .chain-icon { width: 28px; height: 28px; border-radius: 8px; flex: none; object-fit: cover; }
  `;
  const CHECK_SVG = `<svg class="check" viewBox="0 0 24 24"><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"/></svg>`;

  const dropdown = (() => {
    let host = null;
    let cleanup = null;

    function close() {
      if (!host) return;
      host.remove();
      host = null;
      if (cleanup) cleanup();
      cleanup = null;
    }

    // items: [{ id, iconHtml, title, subtitle, disabled }]
    function open({ anchor, title, items, selected, themeVars, onSelect }) {
      close();
      host = document.createElement("div");
      host.setAttribute("data-ephi-dropdown", "");
      const root = host.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${DROPDOWN_STYLE}</style><div class="menu" role="menu">
        ${title ? `<div class="title">${escapeHtml(title)}</div>` : ""}
        ${items.map((item) => `
          <button role="menuitem" data-id="${escapeHtml(item.id)}"${item.disabled ? " disabled" : ""}>
            ${item.iconHtml}
            <span class="names"><b>${escapeHtml(item.title)}</b>${item.subtitle ? `<small>${escapeHtml(item.subtitle)}</small>` : ""}</span>
            ${String(item.id) === String(selected) ? CHECK_SVG : ""}
          </button>`).join("")}</div>`;
      const menu = root.querySelector(".menu");
      applyTheme(menu, themeVars);
      document.body.appendChild(host);

      // Drop down below the anchor, right-aligned with it; flip up only if there's no room below
      const rect = anchor.getBoundingClientRect();
      const width = menu.offsetWidth;
      const height = menu.offsetHeight;
      const below = rect.bottom + 6 + height <= window.innerHeight - 8;
      host.style.top = `${below ? rect.bottom + 6 : Math.max(8, rect.top - 6 - height)}px`;
      host.style.left = `${Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))}px`;

      root.addEventListener("click", (event) => {
        const item = event.target.closest("button[data-id]");
        if (!item || item.disabled) return;
        close();
        onSelect(item.dataset.id);
      });
      ["mousedown", "pointerdown", "keydown", "keyup"].forEach((type) => host.addEventListener(type, (event) => event.stopPropagation()));

      const onOutside = (event) => { const path = event.composedPath(); if (!path.includes(host) && !path.includes(anchor)) close(); };
      const onKey = (event) => { if (event.key === "Escape") close(); };
      const onScroll = () => close();
      setTimeout(() => document.addEventListener("pointerdown", onOutside, true));
      document.addEventListener("keydown", onKey, true);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onScroll);
      cleanup = () => {
        document.removeEventListener("pointerdown", onOutside, true);
        document.removeEventListener("keydown", onKey, true);
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onScroll);
      };
      const first = root.querySelector("button:not(:disabled)");
      if (first) first.focus({ preventScroll: true });
    }

    return { open, close, isOpen: () => !!host };
  })();

  // ---------------------------------------------------------------------------
  // Panel UI
  // ---------------------------------------------------------------------------
  const VERDICT_STYLE = `
    .ic-mark { width: 11px; height: 15px; fill: currentColor; flex: none; }
    .safe { --verdict: rgb(0, 186, 124); }
    .warn { --verdict: rgb(255, 173, 31); }
    .block { --verdict: #ff4c3f; }
  `;
  const STYLE = `${VERDICT_STYLE}
    :host { all: initial; display: block; }
    * { box-sizing: border-box; }
    .root { font-family: var(--font); color: var(--text); -webkit-font-smoothing: antialiased; container-type: inline-size; }

    .collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .25s ease; }
    .open .collapse { grid-template-rows: 1fr; }
    .collapse-inner { overflow: hidden; min-height: 0; }

    .panel {
      background: var(--bg);
      border: 1px solid var(--border);
      border-top: 0;
      border-radius: 0 0 12px 12px;
      padding: 12px;
      display: flex; flex-direction: column; gap: 10px;
      cursor: default;
    }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 32px; }
    .seg { display: inline-flex; border: 1px solid var(--border); border-radius: 9999px; padding: 2px; }
    .seg button {
      font: inherit; font-size: 13px; font-weight: 700; color: var(--muted);
      background: none; border: 0; border-radius: 9999px; padding: 4px 14px; cursor: pointer;
      transition: background-color .15s, color .15s;
    }
    .seg button:hover { color: var(--text); }
    .seg button.on { background: var(--text); color: var(--bg); }

    /* Wallet: "Connect wallet" before connecting, then [network icon] address ⌄ */
    .wallet {
      display: inline-flex; align-items: center; gap: 8px;
      font: inherit; font-size: 14px; font-weight: 700; color: var(--text);
      background: none; border: 1px solid var(--border); border-radius: 9999px;
      height: 32px; padding: 0 12px; cursor: pointer; white-space: nowrap;
      transition: background-color .15s;
    }
    .wallet:hover { background: var(--hover); }
    .wallet.connected { padding: 0 8px 0 4px; gap: 6px; }
    .wallet .chain-icon { width: 22px; height: 22px; border-radius: 6px; object-fit: cover; }
    .wallet .caret { width: 16px; height: 16px; fill: var(--muted); }
    .wallet .dot { width: 8px; height: 8px; border-radius: 50%; background: rgb(255, 173, 31); }

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
    .lbl-row { display: flex; justify-content: space-between; gap: 8px; }
    .lbl, .sub { font-size: 13px; color: var(--muted); line-height: 16px; white-space: nowrap; }
    .sub { min-height: 16px; }
    .balance { font: inherit; font-size: 13px; line-height: 16px; color: var(--muted); background: none; border: 0; padding: 0; cursor: pointer; white-space: nowrap; }
    .balance:hover { color: var(--accent); }
    .line { display: flex; align-items: center; gap: 8px; min-height: 28px; }
    .line input, .line .out {
      flex: 1; min-width: 0;
      font: inherit; font-size: 20px; font-weight: 700; line-height: 24px;
      color: var(--text); background: none; border: 0; outline: none; padding: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .line input::placeholder { color: var(--muted); }
    .out.empty, .out.loading { color: var(--muted); }
    .out.loading { animation: pulse 1s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity: .45; } }

    .chip {
      display: inline-flex; align-items: center; gap: 6px; flex: none;
      font: inherit; font-size: 15px; font-weight: 700; color: var(--text);
      background: var(--bg); border: 1px solid var(--border); border-radius: 9999px;
      padding: 3px 10px 3px 4px; height: 30px;
    }
    button.chip { cursor: pointer; }
    button.chip:hover { background: var(--hover); }
    .caret { width: 14px; height: 14px; fill: var(--muted); margin-left: -2px; flex: none; }
    .token { position: relative; display: inline-flex; flex: none; }
    .icon {
      width: 22px; height: 22px; border-radius: 50%; flex: none;
      display: inline-flex; align-items: center; justify-content: center;
      color: #fff; font-size: 11px; font-weight: 700; object-fit: cover;
    }
    /* Network badge on token icons */
    .badge {
      position: absolute; right: -3px; bottom: -3px; width: 12px; height: 12px;
      border-radius: 4px; border: 1.5px solid var(--bg); object-fit: cover; background: var(--bg);
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

    .meta { display: flex; align-items: center; justify-content: space-between; gap: 4px 12px; flex-wrap: wrap; font-size: 13px; color: var(--muted); min-height: 16px; }
    .details { display: flex; flex-wrap: wrap; gap: 4px 8px; }
    .details .warn { color: rgb(255, 173, 31); }
    .via { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; margin-left: auto; }
    .via img { width: 14px; height: 14px; border-radius: 50%; }
    .via b { color: var(--text); font-weight: 700; }

    .cta {
      width: 100%; height: 44px;
      font: inherit; font-size: 16px; font-weight: 700;
      color: var(--bg); background: var(--text);
      border: 0; border-radius: 9999px; cursor: pointer;
      transition: opacity .15s;
    }
    .cta:hover { opacity: .9; }
    .cta:disabled { opacity: .5; cursor: default; }
    .status { font-size: 13px; color: var(--muted); line-height: 18px; text-align: center; }
    .status.error { color: rgb(244, 33, 46); }
    .status.ok { color: rgb(0, 186, 124); }
    .status a { color: var(--accent); text-decoration: none; }
    .status a:hover { text-decoration: underline; }

    /* Intercepta verdict on the card's token */
    .security { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 16px; color: var(--verdict, var(--muted)); }
    .security .ic-mark { width: 10px; height: 14px; margin-top: 1px; }
    .security b { font-weight: 700; }
    .security.loading { animation: pulse 1s ease-in-out infinite; }
    .status .ic-mark { width: 9px; height: 12px; vertical-align: -1px; margin-right: 2px; }

    /* Held transaction: Intercepta flagged it, the user decides */
    .risk { text-align: left; display: flex; flex-direction: column; gap: 6px; }
    .risk ul { margin: 0; padding-left: 18px; }
    .risk-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .risk-actions button {
      font: inherit; font-size: 13px; font-weight: 700; border-radius: 9999px; height: 30px; padding: 0 14px; cursor: pointer;
      color: var(--text); background: none; border: 1px solid var(--border);
    }
    .risk-actions button:hover { background: var(--hover); }
    .risk-actions button[data-risk="continue"] { color: #ff4c3f; border-color: #ff4c3f; }
  `;

  // The Buy button that sits inside X's ticker card, next to the sparkline
  const TRIGGER_STYLE = `${VERDICT_STYLE}
    :host { all: initial; }
    .toggle {
      display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
      font-family: var(--font); font-size: 13px; font-weight: 700; line-height: 1;
      color: var(--bg); background: var(--text); border: 1px solid var(--text); border-radius: 9999px;
      height: 28px; padding: 0 12px 0 10px; cursor: pointer;
      -webkit-font-smoothing: antialiased;
      transition: opacity .15s, background-color .15s, color .15s, border-color .15s;
    }
    .toggle:hover { opacity: .9; }
    .toggle svg { width: 14px; height: 14px; fill: currentColor; }
    /* Intercepta verdict, nested at the end of the Buy button while the panel is collapsed */
    .toggle:has(.verdict) { padding-right: 3px; }
    .verdict {
      display: inline-flex; align-items: center; gap: 4px; margin-left: 3px;
      font-size: 11px; height: 20px; padding: 0 7px 0 6px; border-radius: 9999px;
      color: #fff; background: var(--verdict);
    }
    .verdict.warn { color: #000; }
    .verdict.loading, .verdict.unknown { padding: 0 6px; color: var(--bg); background: color-mix(in srgb, var(--bg) 18%, transparent); }
    .verdict.loading { animation: pulse 1s ease-in-out infinite; }
    .toggle .verdict .ic-mark { width: 8px; height: 11px; }
    @keyframes pulse { 50% { opacity: .45; } }
    .toggle.open { background: transparent; color: var(--text); border-color: var(--border); }
    .toggle.open:hover { background: var(--hover); opacity: 1; }
  `;

  const CARET_SVG = `<svg class="caret" viewBox="0 0 24 24"><path d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"/></svg>`;
  const ARROW_SVG = `<svg viewBox="0 0 24 24"><path d="M13 3v13.59l5.043-5.05 1.414 1.42L12 20.41l-7.457-7.45 1.414-1.42L11 16.59V3h2z"/></svg>`;
  const SWAP_SVG = `<svg viewBox="0 0 24 24"><path d="M16.293 3.293a1 1 0 0 1 1.414 0l3.5 3.5a1 1 0 0 1 0 1.414l-3.5 3.5-1.414-1.414L18.086 8.5H6V6.5h12.086l-1.793-1.793a1 1 0 0 1 0-1.414zM7.707 12.293l1.414 1.414L7.328 15.5H19.5v2H7.328l1.793 1.793-1.414 1.414-3.5-3.5a1 1 0 0 1 0-1.414l3.5-3.5z"/></svg>`;
  // Intercepta's logo mark: a 3x4 grid of dots (same geometry as intercepta.io/images/logo-nav.svg)
  const INTERCEPTA_MARK_SVG = `<svg class="ic-mark" viewBox="0 0 21 29" aria-hidden="true">${
    [2.5, 10.5, 18.5, 26.5].flatMap((cy) => [2.5, 10.5, 18.5].map((cx) => `<circle cx="${cx}" cy="${cy}" r="2.5"/>`)).join("")
  }</svg>`;
  const CLOSE_SVG = `<svg viewBox="0 0 24 24"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>`;

  function createPanel(article, link, ticker) {
    const themeVars = readTheme(article, link, ticker);
    const host = document.createElement("div");
    host.setAttribute(HOST_ATTR, ticker.symbol);
    const root = host.attachShadow({ mode: "open" });

    const availableChains = chainsForTicker(ticker.symbol);
    const initialChain = wallet.chainId && availableChains.includes(wallet.chainId)
      ? wallet.chainId
      : availableChains.includes(DEFAULT_CHAIN) ? DEFAULT_CHAIN : availableChains[0];
    const state = {
      open: false,
      chainId: initialChain,
      side: "buy",
      quoteToken: "USDC",
      amount: "",
      quote: null, // { amountOut, priceImpact, gasFeeUSD, estimated, error }
      quoting: false,
      balance: null,
      busy: false,
      security: null, // Intercepta verdict on the card's token: { loading } | { action, reasons } | { error } | { native }
    };
    let quoteSeq = 0;
    let pendingRisk = null; // { resolve, reject } while a flagged transaction waits for the user
    let quoteTimer = null;

    root.innerHTML = `
      <style>${STYLE}</style>
      <div class="root">
        <div class="collapse">
          <div class="collapse-inner">
            <div class="panel">
              <div class="head">
                <div class="seg" role="tablist">
                  <button data-side="buy" class="on">Buy</button>
                  <button data-side="sell">Sell</button>
                </div>
                <button class="wallet"></button>
              </div>
              <div class="row">
                <label class="box pay">
                  <div class="lbl-row"><span class="lbl">You pay</span><button class="balance" hidden></button></div>
                  <div class="line">
                    <input class="amount" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Amount to pay">
                    <span class="pay-token"></span>
                  </div>
                  <span class="sub pay-usd">$0.00</span>
                </label>
                <button class="flip" title="Switch buy/sell" aria-label="Switch buy and sell">${ARROW_SVG}</button>
                <div class="box get">
                  <div class="lbl-row"><span class="lbl">You receive</span></div>
                  <div class="line">
                    <span class="out empty">0</span>
                    <span class="get-token"></span>
                  </div>
                  <span class="sub get-usd">$0.00</span>
                </div>
              </div>
              <div class="meta">
                <div class="details"></div>
                <span class="via">via ${tokenLogoHtml("UNI", "uni")}<b>Uniswap</b></span>
              </div>
              <div class="security" hidden></div>
              <button class="cta"></button>
              <div class="status" hidden></div>
            </div>
          </div>
        </div>
      </div>`;

    const $ = (selector) => root.querySelector(selector);
    applyTheme($(".root"), themeVars);
    const input = $(".amount");
    const status = $(".status");

    // Buy button inside the card: appended to X's flex row, so the sparkline shrinks to make room
    const triggerHost = document.createElement("span");
    triggerHost.setAttribute("data-ephi-ticker-trigger", "");
    triggerHost.style.cssText = "display:flex;align-items:center;flex:none;padding:0 12px 0 8px;";
    const triggerRoot = triggerHost.attachShadow({ mode: "open" });
    triggerRoot.innerHTML = `<style>${TRIGGER_STYLE}</style><button class="toggle" aria-expanded="false"></button>`;
    const toggle = triggerRoot.querySelector(".toggle");
    applyTheme(toggle, themeVars);
    function ensureTrigger() {
      if (triggerHost.parentElement !== link) link.appendChild(triggerHost);
    }
    ensureTrigger();
    host.ensureTrigger = ensureTrigger;

    // --- state helpers -------------------------------------------------------
    function chain() { return CHAINS[state.chainId]; }
    function mainToken() { return tokenForTicker(ticker.symbol, state.chainId); }
    function quoteTokens() { return QUOTE_TOKENS.filter((s) => s !== mainToken() && tokenOn(state.chainId, s)); }
    function payToken() { return state.side === "buy" ? state.quoteToken : mainToken(); }
    function getToken() { return state.side === "buy" ? mainToken() : state.quoteToken; }
    function decimalsOf(symbol) { return tokenOn(state.chainId, symbol).decimals; }
    function walletOnChain() { return !!wallet.account && wallet.chainId === state.chainId; }

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
    // USD price for display: stables are $1, the card's token uses the card price
    function usdPrice(symbol) {
      if (TOKEN_INFO[symbol].stable) return 1;
      if (symbol === mainToken()) return tickerPrice();
      return null;
    }
    function amountIn() {
      return parseFloat(state.amount) > 0 ? parseUnits(state.amount, decimalsOf(payToken())) : 0n;
    }

    let statusTimer = null;
    function setStatus(html, kind, hideAfterMs) {
      clearTimeout(statusTimer);
      status.hidden = !html;
      status.innerHTML = html || "";
      status.className = "status" + (kind ? " " + kind : "");
      if (hideAfterMs) statusTimer = setTimeout(() => setStatus(""), hideAfterMs);
    }

    function tokenIcon(symbol) {
      // The card's own token uses X's icon so it matches the card
      const icon = symbol === mainToken() && ticker.iconSrc ? `<img class="icon" src="${escapeHtml(ticker.iconSrc)}" alt="">` : tokenLogoHtml(symbol);
      return `<span class="token">${icon}${chainLogoHtml(state.chainId, "badge")}</span>`;
    }
    function chipHtml(symbol, selectable) {
      const tag = selectable ? "button" : "span";
      return `<${tag} class="chip"${selectable ? ' aria-haspopup="menu"' : ""}>${tokenIcon(symbol)}${escapeHtml(symbol)}${selectable ? CARET_SVG : ""}</${tag}>`;
    }

    // --- rendering -----------------------------------------------------------
    function render() {
      $(".root").classList.toggle("open", state.open);
      toggle.classList.toggle("open", state.open);
      toggle.setAttribute("aria-expanded", String(state.open));
      const verdict = state.open ? null : verdictBadge();
      toggle.innerHTML = state.open ? `${CLOSE_SVG}<span>Close</span>` : `${SWAP_SVG}<span>Buy</span>${verdict ? verdict.html : ""}`;
      if (verdict) toggle.title = verdict.title;
      else toggle.removeAttribute("title");
      // Join the panel to the card while open: square off the card's bottom corners
      link.style.borderBottomLeftRadius = state.open ? "0" : "";
      link.style.borderBottomRightRadius = state.open ? "0" : "";

      // Wallet button
      const walletButton = $(".wallet");
      walletButton.classList.toggle("connected", !!wallet.account);
      walletButton.disabled = state.busy;
      if (wallet.account) {
        walletButton.title = `Network: ${chain().name}`;
        walletButton.innerHTML = `${chainLogoHtml(state.chainId)}<span>${shortAddress(wallet.account)}</span>${walletOnChain() ? "" : '<span class="dot" title="Wallet is on another network"></span>'}${CARET_SVG}`;
      } else {
        walletButton.title = "";
        walletButton.innerHTML = "Connect wallet";
      }

      root.querySelectorAll(".seg button").forEach((b) => b.classList.toggle("on", b.dataset.side === state.side));
      const canPickToken = quoteTokens().length > 1;
      $(".pay-token").innerHTML = chipHtml(payToken(), state.side === "buy" && canPickToken);
      $(".get-token").innerHTML = chipHtml(getToken(), state.side === "sell" && canPickToken);

      const payAmount = parseFloat(state.amount) || 0;
      const payPrice = usdPrice(payToken());
      $(".pay-usd").textContent = payPrice === null ? "" : formatUsd(payAmount * payPrice);

      // Balance of the pay token (click for max)
      const balanceButton = $(".balance");
      balanceButton.hidden = state.balance === null;
      if (state.balance !== null) balanceButton.textContent = `Balance ${formatAmount(unitsToNumber(state.balance, decimalsOf(payToken())))}`;

      // Output
      const out = $(".out");
      const received = state.quote && state.quote.amountOut !== null ? unitsToNumber(state.quote.amountOut, decimalsOf(getToken())) : 0;
      out.classList.toggle("loading", state.quoting);
      out.classList.toggle("empty", !(received > 0));
      out.textContent = received > 0 ? (state.quote.estimated ? "~" : "") + formatAmount(received) : "0";
      out.style.fontSize = out.textContent.length > 9 ? "16px" : "";
      input.style.fontSize = input.value.length > 9 ? "16px" : "";
      const getPrice = usdPrice(getToken());
      $(".get-usd").textContent = getPrice === null ? "" : formatUsd(received * getPrice);

      // Quote details
      const parts = [];
      if (state.quote && !state.quote.estimated && received > 0) {
        const rate = state.side === "buy" ? payAmount / received : received / payAmount;
        parts.push(`1 ${escapeHtml(mainToken())} = ${formatAmount(rate)} ${escapeHtml(state.quoteToken)}`);
        if (state.quote.gasFeeUSD) parts.push(`Fee ${formatUsd(parseFloat(state.quote.gasFeeUSD))}`);
        if (typeof state.quote.priceImpact === "number") {
          const impact = state.quote.priceImpact;
          parts.push(`<span class="${impact > 2 ? "warn" : ""}">Impact ${impact < 0.01 ? "<0.01" : impact.toFixed(2)}%</span>`);
        }
      } else if (state.quote && state.quote.error) {
        parts.push(`<span class="warn">${escapeHtml(state.quote.error)}${state.quote.estimated ? " · estimate from card price" : ""}</span>`);
      } else {
        parts.push(`1 ${escapeHtml(mainToken())} ≈ ${formatUsd(tickerPrice())}`);
      }
      $(".details").innerHTML = parts.join("<span>·</span>");

      renderSecurity();

      // Main button
      const cta = $(".cta");
      const insufficient = state.balance !== null && amountIn() > state.balance;
      if (state.busy) {
        cta.disabled = true;
      } else if (buyBlocked()) {
        cta.textContent = `${mainToken()} flagged as unsafe`;
        cta.disabled = true;
      } else if (!wallet.account) {
        cta.textContent = "Connect wallet";
        cta.disabled = false;
      } else if (!walletOnChain()) {
        cta.textContent = `Switch to ${chain().name}`;
        cta.disabled = false;
      } else if (!(payAmount > 0)) {
        cta.textContent = "Enter an amount";
        cta.disabled = true;
      } else if (insufficient) {
        cta.textContent = `Not enough ${payToken()}`;
        cta.disabled = true;
      } else {
        cta.textContent = `${state.side === "buy" ? "Buy" : "Sell"} ${mainToken()}`;
        cta.disabled = !state.quote || state.quote.amountOut === null || state.quoting || !!state.quote.estimated;
      }
    }

    // Buying a token Intercepta blocks is refused. Selling one stays possible: it's how you get out.
    function buyBlocked() {
      return state.side === "buy" && !!state.security && state.security.action === "block";
    }

    function renderSecurity() {
      const row = $(".security");
      const security = state.security;
      const symbol = escapeHtml(mainToken());
      row.hidden = !security || !!security.native;
      if (row.hidden) return;
      row.removeAttribute("title");
      if (security.loading) {
        row.className = "security loading";
        row.innerHTML = `${INTERCEPTA_MARK_SVG}<span>Checking ${symbol} with Intercepta…</span>`;
      } else if (security.error) {
        row.className = "security";
        row.title = security.error;
        row.innerHTML = `${INTERCEPTA_MARK_SVG}<span>Intercepta check unavailable</span>`;
      } else if (security.action === "info") {
        row.className = "security safe";
        row.innerHTML = `${INTERCEPTA_MARK_SVG}<span>No known risks for ${symbol} · Intercepta</span>`;
      } else {
        const reasons = security.reasons.length ? security.reasons.map(escapeHtml).join(" · ") : `${security.action === "block" ? "Unsafe" : "Risky"} token`;
        row.className = `security ${security.action}`;
        row.innerHTML = `${INTERCEPTA_MARK_SVG}<span><b>Intercepta ${security.action === "block" ? "blocked" : "flagged"} ${symbol}:</b> ${reasons}</span>`;
      }
    }

    // Compact verdict inside the collapsed Buy button -> { html, title }, or null when there's nothing to show
    function verdictBadge() {
      const security = state.security;
      if (!security || security.native) return null;
      const symbol = mainToken();
      let kind, label, title;
      if (security.loading) [kind, label, title] = ["loading", "", `Checking ${symbol} with Intercepta…`];
      else if (security.error) [kind, label, title] = ["unknown", "", `Intercepta check unavailable (${security.error})`];
      else if (security.action === "info") [kind, label, title] = ["safe", "Safe", `Intercepta: no known risks for ${symbol}`];
      else if (security.action === "warn") [kind, label, title] = ["warn", "Caution", `Intercepta flagged ${symbol}: ${security.reasons.join(" · ") || "risky token"}`];
      else [kind, label, title] = ["block", "Unsafe", `Intercepta blocked ${symbol}: ${security.reasons.join(" · ") || "unsafe token"}`];
      return { html: `<span class="verdict ${kind}">${INTERCEPTA_MARK_SVG}${label ? `<span>${label}</span>` : ""}</span>`, title };
    }

    function checkSecurity() {
      const chainId = state.chainId;
      const token = tokenOn(chainId, mainToken());
      if (token.address === NATIVE) {
        state.security = { native: true };
        render();
        return;
      }
      state.security = { loading: true };
      render();
      tokenRisk(chainId, token.address)
        .then((risk) => risk, (error) => ({ error: error.message }))
        .then((security) => {
          if (chainId !== state.chainId) return;
          state.security = security;
          render();
        });
    }

    // Hold a flagged transaction until the user cancels or explicitly continues
    function confirmRisk(reasons) {
      return new Promise((resolve, reject) => {
        pendingRisk = { resolve, reject };
        setStatus(`<div class="risk"><b>Intercepta flagged this transaction</b><ul>${reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
          <div class="risk-actions"><button data-risk="cancel">Cancel</button><button data-risk="continue">Continue anyway</button></div></div>`, "error");
      });
    }

    function answerRisk(proceed) {
      const pending = pendingRisk;
      pendingRisk = null;
      if (!pending) return;
      setStatus("");
      if (proceed) pending.resolve();
      else pending.reject(Object.assign(new Error("Cancelled after Intercepta's warning."), { code: "RISK_CANCELLED" }));
    }

    // Simulate with Intercepta, then send. If the check itself fails the transaction still goes
    // through: every token here is on the verified list, and the wallet prompt remains the final gate.
    async function guardedSend(chainId, tx, step) {
      step("Checking transaction…");
      let scan = null;
      try {
        scan = await scanTransaction(chainId, tx);
      } catch (error) {
        console.warn("[Ephi] Intercepta transaction check failed:", error.message);
      }
      if (scan && scan.reasons.length) await confirmRisk(scan.reasons);
      return { scan, send: () => sendTransaction(tx) };
    }

    // --- quotes --------------------------------------------------------------
    function estimateQuote() {
      const payPrice = usdPrice(payToken());
      const getPrice = usdPrice(getToken());
      if (payPrice === null || getPrice === null) return null;
      const out = (parseFloat(state.amount) * payPrice) / getPrice;
      const decimals = decimalsOf(getToken());
      return parseUnits(out.toFixed(Math.min(decimals, 12)), decimals);
    }

    function scheduleQuote() {
      clearTimeout(quoteTimer);
      const seq = ++quoteSeq;
      if (!(amountIn() > 0n)) {
        state.quote = null;
        state.quoting = false;
        render();
        return;
      }
      state.quoting = true;
      render();
      quoteTimer = setTimeout(async () => {
        try {
          const request = quoteRequest(state.chainId, payToken(), getToken(), amountIn().toString(), wallet.account || PREVIEW_SWAPPER);
          const response = await uniswapApi("quote", request);
          if (seq !== quoteSeq) return;
          const quote = response.quote || {};
          state.quote = {
            amountOut: quote.output ? BigInt(quote.output.amount) : null,
            priceImpact: quote.priceImpact,
            gasFeeUSD: quote.gasFeeUSD,
            estimated: false,
          };
        } catch (error) {
          if (seq !== quoteSeq) return;
          const estimate = estimateQuote();
          state.quote = { amountOut: estimate, estimated: estimate !== null, error: error.message };
        }
        state.quoting = false;
        render();
      }, 400);
    }

    async function refreshBalance() {
      if (!walletOnChain()) {
        state.balance = null;
        render();
        return;
      }
      const chainId = state.chainId;
      const symbol = payToken();
      try {
        const balance = await tokenBalance(chainId, symbol);
        if (chainId === state.chainId && symbol === payToken()) state.balance = balance;
      } catch {
        state.balance = null;
      }
      render();
    }

    // --- actions -------------------------------------------------------------
    // Switching sides keeps the trade the same size: what you'd receive becomes what you pay
    function setSide(side) {
      if (side === state.side) return;
      // A quote still loading belongs to an older amount, so estimate from the card price instead
      const out = !state.quoting && state.quote && state.quote.amountOut !== null ? state.quote.amountOut : (amountIn() > 0n ? estimateQuote() : null);
      const outDecimals = decimalsOf(getToken());
      state.side = side;
      state.amount = out ? unitsToInput(out, outDecimals) : "";
      input.value = state.amount;
      state.balance = null;
      setStatus("");
      scheduleQuote();
      refreshBalance();
    }

    function setChain(chainId) {
      if (chainId === state.chainId || !availableChains.includes(chainId)) return;
      // Keep the amount only if the token being paid stays the same
      const previousPay = payToken();
      state.chainId = chainId;
      if (!tokenOn(chainId, state.quoteToken) || state.quoteToken === mainToken()) state.quoteToken = quoteTokens()[0];
      if (payToken() !== previousPay) { state.amount = ""; input.value = ""; }
      state.balance = null;
      state.quote = null;
      checkSecurity();
      setStatus("");
      scheduleQuote();
      refreshBalance();
    }

    // When the wallet changes network, follow it if the card's token exists there
    function followWalletChain() {
      if (!state.busy && wallet.chainId && wallet.chainId !== state.chainId && availableChains.includes(wallet.chainId)) setChain(wallet.chainId);
    }

    function closeMenu() {
      dropdown.close();
    }

    function openTokenMenu(anchor) {
      dropdown.open({
        anchor,
        themeVars,
        selected: state.quoteToken,
        items: quoteTokens().map((symbol) => ({ id: symbol, iconHtml: tokenLogoHtml(symbol), title: symbol, subtitle: TOKEN_INFO[symbol].name })),
        onSelect: (symbol) => {
          if (symbol === state.quoteToken) return;
          state.quoteToken = symbol;
          state.balance = null;
          scheduleQuote();
          refreshBalance();
        },
      });
    }

    function openNetworkMenu(anchor) {
      dropdown.open({
        anchor,
        themeVars,
        title: "Network",
        selected: state.chainId,
        items: CHAIN_ORDER.map((chainId) => {
          const available = availableChains.includes(chainId);
          return {
            id: chainId,
            iconHtml: chainLogoHtml(chainId),
            title: CHAINS[chainId].name,
            subtitle: !available ? `${ticker.symbol} not available` : wallet.chainId === chainId ? "Wallet network" : "",
            disabled: !available,
          };
        }),
        onSelect: async (id) => {
          const chainId = Number(id);
          setChain(chainId);
          try {
            await ensureChain(chainId);
          } catch (error) {
            const rejected = error.code === 4001 || /reject|denied/i.test(error.message);
            if (!rejected) setStatus(escapeHtml(error.message), "error");
          }
          refreshBalance();
        },
      });
    }

    async function executeSwap() {
      const chainId = state.chainId;
      const tokenIn = payToken();
      const tokenOut = getToken();
      const amount = amountIn().toString();
      const explorer = CHAINS[chainId];
      const step = (text) => { $(".cta").textContent = text; };

      state.busy = true;
      render();
      try {
        // 1. Permit2 approval for ERC-20 input (one-time per token)
        if (tokenOn(chainId, tokenIn).address !== NATIVE) {
          step("Checking approval…");
          const approval = await uniswapApi("check_approval", {
            walletAddress: wallet.account, token: tokenOn(chainId, tokenIn).address, amount, chainId,
          });
          if (approval.cancel) {
            const { send } = await guardedSend(chainId, approval.cancel, step);
            step("Reset approval in wallet…");
            await waitForReceipt(await send());
          }
          if (approval.approval) {
            const { send } = await guardedSend(chainId, approval.approval, step);
            step(`Approve ${tokenIn} in wallet…`);
            setStatus(`One-time approval so Uniswap can use your ${escapeHtml(tokenIn)}.`);
            await waitForReceipt(await send());
          }
        }

        // 2. Fresh quote for the connected wallet
        step("Getting quote…");
        const quoteResponse = await uniswapApi("quote", quoteRequest(chainId, tokenIn, tokenOut, amount, wallet.account));

        // 3. Permit2 signature, if the quote needs one
        let signature;
        if (quoteResponse.permitData) {
          step("Sign permit in wallet…");
          setStatus("Sign the Permit2 message (free, no transaction).");
          signature = await walletRequest("eth_signTypedData_v4", [wallet.account, typedDataFromPermit(quoteResponse.permitData)]);
        }

        // 4. Build the swap transaction, simulate it with Intercepta, then send it
        setStatus("");
        const swapRequest = { quote: quoteResponse.quote };
        if (quoteResponse.permitData) Object.assign(swapRequest, { signature, permitData: quoteResponse.permitData });
        const { swap } = await uniswapApi("swap", swapRequest);
        const { scan, send } = await guardedSend(chainId, swap, step);
        step("Confirm swap in wallet…");
        const simulated = scan && scan.receive.find((asset) => asset.symbol && asset.amount);
        if (simulated) setStatus(`${INTERCEPTA_MARK_SVG} Simulated by Intercepta: you receive ~${formatAmount(parseFloat(simulated.amount))} ${escapeHtml(simulated.symbol)}`);
        const hash = await send();

        step("Swapping…");
        const txLink = `<a href="${explorer.explorer}/tx/${hash}" target="_blank" rel="noopener">View on ${explorer.explorerName}</a>`;
        setStatus(`Transaction sent · ${txLink}`);
        await waitForReceipt(hash);

        const received = unitsToNumber(quoteResponse.quote.output.amount, tokenOn(chainId, tokenOut).decimals);
        setStatus(`✓ ${state.side === "buy" ? "Bought" : "Sold"} · ~${formatAmount(received)} ${escapeHtml(tokenOut)} received · ${txLink}`, "ok", 5000);
        state.amount = "";
        input.value = "";
        state.quote = null;
      } catch (error) {
        const rejected = error.code === 4001 || /reject|denied/i.test(error.message);
        if (error.code === "RISK_CANCELLED") setStatus(escapeHtml(error.message));
        else setStatus(rejected ? "Cancelled in wallet." : escapeHtml(error.message), rejected ? "" : "error");
      } finally {
        state.busy = false;
        refreshBalance();
        render();
      }
    }

    async function connect() {
      setStatus("Check your wallet to connect…");
      await connectWallet();
      setStatus("");
      if (availableChains.includes(wallet.chainId)) setChain(wallet.chainId);
      else await ensureChain(state.chainId);
      scheduleQuote(); // re-quote for the connected wallet
      refreshBalance();
    }

    async function onCta() {
      try {
        if (!wallet.account) await connect();
        else if (!walletOnChain()) await ensureChain(state.chainId);
        else await executeSwap();
      } catch (error) {
        const rejected = error.code === 4001 || /reject|denied/i.test(error.message);
        setStatus(rejected ? "Cancelled in wallet." : escapeHtml(error.message), rejected ? "" : "error");
      }
      render();
    }

    // --- events --------------------------------------------------------------
    // Keep X from treating clicks/keys inside the panel as tweet clicks or keyboard shortcuts
    ["click", "mousedown", "mouseup", "pointerdown", "pointerup", "keydown", "keyup", "keypress", "touchstart", "touchend"].forEach((type) =>
      host.addEventListener(type, (event) => event.stopPropagation())
    );

    function toggleMenu(open) {
      if (dropdown.isOpen()) closeMenu();
      else open();
    }

    root.addEventListener("click", (event) => {
      const target = event.target;
      const riskButton = target.closest("[data-risk]");
      if (riskButton) { answerRisk(riskButton.dataset.risk === "continue"); return; }
      if (state.busy) return;
      const walletButton = target.closest(".wallet");
      if (walletButton) {
        if (!wallet.account) onCta();
        else toggleMenu(() => openNetworkMenu(walletButton));
        return;
      }
      const sideButton = target.closest(".seg button");
      if (sideButton) { setSide(sideButton.dataset.side); closeMenu(); return; }
      if (target.closest(".flip")) { setSide(state.side === "buy" ? "sell" : "buy"); closeMenu(); return; }
      if (target.closest(".balance") && state.balance !== null) {
        event.preventDefault();
        let max = state.balance;
        if (tokenOn(state.chainId, payToken()).address === NATIVE) max = max > chain().gasReserveWei ? max - chain().gasReserveWei : 0n;
        state.amount = unitsToInput(max, decimalsOf(payToken()));
        input.value = state.amount;
        scheduleQuote();
        return;
      }
      const chip = target.closest("button.chip");
      if (chip) { event.preventDefault(); toggleMenu(() => openTokenMenu(chip)); return; }
      if (target.closest(".cta")) { onCta(); return; }
    });

    // The trigger lives inside X's <a> card link: stop both the navigation and X's own handlers
    ["mousedown", "mouseup", "pointerdown", "pointerup", "keydown", "keyup", "keypress", "touchstart", "touchend"].forEach((type) =>
      triggerHost.addEventListener(type, (event) => event.stopPropagation())
    );
    triggerHost.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.open = !state.open;
      closeMenu();
      render();
      if (state.open) {
        setTimeout(() => input.focus({ preventScroll: true }), 150);
        refreshBalance();
        if (!state.security || state.security.error) checkSecurity();
      }
    });

    input.addEventListener("input", () => {
      // Allow only a positive decimal number, with at most the token's decimals
      let value = input.value.replace(/,/g, ".").replace(/[^\d.]/g, "");
      const dot = value.indexOf(".");
      if (dot !== -1) value = value.slice(0, dot + 1) + value.slice(dot + 1).replace(/\./g, "").slice(0, decimalsOf(payToken()));
      if (value !== input.value) input.value = value;
      state.amount = value;
      setStatus("");
      scheduleQuote();
    });

    if (!quoteTokens().includes(state.quoteToken)) state.quoteToken = quoteTokens()[0];

    host.addEventListener("ephi:wallet", () => { followWalletChain(); refreshBalance(); render(); });
    checkSecurity(); // verdicts are cached per token (here and in the backend), so cards scrolling by stay cheap
    // Keep the card-price line current while no quote is shown
    new MutationObserver(() => { if (!state.quote && !state.busy) render(); }).observe(link, { childList: true, characterData: true, subtree: true });
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
    if (!container) return;
    const existing = container.nextElementSibling;
    if (existing && existing.hasAttribute(HOST_ATTR)) {
      if (existing.ensureTrigger) existing.ensureTrigger(); // X may re-render the card's contents
      return;
    }

    for (const link of list.querySelectorAll('a[role="link"]')) {
      const ticker = parseTickerLink(link);
      if (!ticker) continue;
      ticker.symbol = ticker.symbol.toUpperCase();
      if (!chainsForTicker(ticker.symbol).length) continue;

      const host = createPanel(article, link, ticker);
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
