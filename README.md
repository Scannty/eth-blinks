# 🌐 XSwap

XSwap is a Chrome extension that lets you buy a token straight from its ticker card on X. When a tweet mentions a supported cashtag (`$ETH`, `$UNI`, `$AERO`, …), X shows a ticker card. XSwap adds a **Buy** button to that card, and pressing it opens a swap panel inside the card. You never leave the timeline.

## Features ✨

- **Swap through Uniswap** 🦄: quotes and swaps run through the Uniswap Trading API on Base, Ethereum, Arbitrum, Optimism and Unichain. Your browser wallet (e.g. MetaMask) signs the transactions. These are real swaps with real funds.
- **Token safety checks with Intercepta** 🛡️: before you buy, XSwap checks the token and the swap transaction with Intercepta. Tokens flagged as risky get a warning or are blocked, and you must confirm before continuing.
- **Creator kickbacks with World ID** 🪪: a tweet's author earns 0.5% of every buy made from the ticker card in their tweet. The fee is paid through Uniswap's integrator fee, straight to the author's wallet. To earn, the author proves with World ID that they are a unique human, so one person can't farm kickbacks with many X accounts.

## How It Works 🔧

```
X ticker card ──► x-ticker-swap.js (swap panel)
                     │  wallet calls ──► bridge.js ──► window.ethereum
                     ▼
                 background.js ──► backend (localhost:8000)
                                     ├─ /uniswap/*     Uniswap Trading API proxy
                                     ├─ /intercepta/*  token and transaction checks
                                     └─ /kickbacks/*   World ID verification + author registry
```

- **`extension/`**: the Manifest V3 extension. `x-ticker-swap.js` injects the Buy button and swap panel, `bridge.js` runs in the page's main world to reach your wallet, and `kickbacks.html` is the World ID verification page for authors.
- **`backend/`**: a small Express server that keeps the API keys and the World ID signing key out of the extension. Verified authors are stored in `backend/data/kickbacks.json`.

## World ID Integration Debrief 🪪

Kickbacks pay tweet authors 0.5% of every buy made from their ticker card, so the reward invites farming with many X accounts. Before an account can earn, the author proves with World ID (Proof of Human, IDKit v4) that they are one unique human. The backend verifies the proof and stores the nullifier, so one human can earn for only one X account.

**Time to first success:** about 1h40m, from starting the integration to the first proof verified by our server. That includes Developer Portal setup and one runtime fix, the WebAssembly permission described below.

**Friction we hit**

- Most examples online target IDKit v2/v3, and `@worldcoin/idkit-standalone` is deprecated. It took a moment to confirm that v4 (`@worldcoin/idkit-core`) with a backend RP signature is the current path.
- `idkit-core` has no ready-made UI outside React. We render the connector URI as a QR code ourselves with a separate QR library.
- The IDKit browser build compiles WebAssembly. Inside a Chrome MV3 extension it failed at runtime until we added `'wasm-unsafe-eval'` to the extension's security policy. The docs don't mention extensions.
- Staging verification is closed by default. Simulator proofs failed with `environment_not_allowed` until we opened a 24-hour staging window and sent its token in an `x-staging-verification-token` header. We only learned this from the error message and the Developer Portal MCP.
- The docs pair `allow_legacy_proofs: true` with `proofOfHuman`, but also warn that legacy and v4 proofs produce different nullifiers. It was unclear which one to store to guarantee one human, one account.

**Missing capability or documentation**

- A vanilla-JS drop-in widget (QR, status, errors) for non-React apps and browser extensions.
- A quickstart section on testing with the simulator that covers the staging window and its token.

**The one improvement with the greatest impact:** document the staging verification window in the main quickstart, or open it automatically for new apps. It was the only step that blocked testing entirely, and the fix is not discoverable from the docs.

## Requirements

- [Node (v18+)](https://nodejs.org/en/download/)
- Chrome (or another Chromium browser) with a wallet extension such as MetaMask

## Quick start

```bash
git clone git@github.com:Scannty/eth-blinks.git
```

### Backend

1. Create `backend/.env` (see `.env.example`):
   - `UNISWAP_API_KEY`: a free key from the [Uniswap developer dashboard](https://developers.uniswap.org/dashboard).
   - `INTERCEPTA_API_KEY`: from [Intercepta](https://intercepta.io).
   - `WORLD_*`: in the [World Developer Portal](https://developer.world.org), create an external app, enable World ID 4.0 and create the `earn-kickbacks` action. Use `staging` to test with the [World ID Simulator](https://simulator.worldcoin.org), or `production` for the real World App.

2. Install and run (port 8000, override with `PORT`):

```bash
cd backend/
npm install
node server.js
```

### Extension

1. Open `chrome://extensions` and enable **Developer mode**
2. Click **Load unpacked** and select the `extension` folder
3. Open x.com and look for a ticker card with a **Buy** button

After changing extension code, click the reload icon on the extension card and refresh X. The extension expects the backend at `http://localhost:8000` (`BACKEND_URL` in `background.js`).
