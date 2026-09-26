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

## Uniswap integration 🦄

Every quote and swap goes through the [Uniswap Trading API](https://developers.uniswap.org), routed over Uniswap v2, v3 and v4 pools on Base, Ethereum, Arbitrum, Optimism and Unichain. Where to find it:

| What | Code |
|---|---|
| API proxy that keeps the API key on the server (`check_approval`, `quote`, `swap` only) | [`backend/uniswap.js`](backend/uniswap.js), route at [`backend/server.js#L14`](backend/server.js#L14) |
| Client for the proxy, with no-route errors mapped to a readable message | [`extension/x-ticker-swap.js#L291-L306`](extension/x-ticker-swap.js#L291-L306) |
| Quote request: exact input, v2/v3/v4 routing, auto slippage, and the author's kickback as an integrator fee | [`extension/x-ticker-swap.js#L309-L324`](extension/x-ticker-swap.js#L309-L324) (fee at [L322](extension/x-ticker-swap.js#L322)) |
| Splitting the quote's output into the buyer's amount and the author's fee | [`extension/x-ticker-swap.js#L327-L335`](extension/x-ticker-swap.js#L327-L335) |
| Turning the quote's `permitData` into an EIP-712 Permit2 signature request | [`extension/x-ticker-swap.js#L338-L346`](extension/x-ticker-swap.js#L338-L346) |
| Live quotes while typing (debounced, stale responses dropped) | [`extension/x-ticker-swap.js#L1259-L1290`](extension/x-ticker-swap.js#L1259-L1290) |
| Swap flow: `check_approval` → `quote` → Permit2 signature → `swap` → send | [`extension/x-ticker-swap.js#L1395-L1469`](extension/x-ticker-swap.js#L1395-L1469) |

Our feedback on building with the Uniswap API is in [FEEDBACK.md](FEEDBACK.md).

## Intercepta security checks 🛡️

People and autonomous agents scan X for alpha and act on cashtags fast, often on tokens someone is shilling. XSwap puts an Intercepta check between seeing a ticker and paying for it, so anything buying through a ticker card sees whether the token and the transaction are safe before money moves.

- **Token check when the panel opens.** Intercepta rates the token. `warn` shows the reasons in the panel, and `block` disables Buy (selling stays possible, so holders can get out).
- **Transaction simulation before every signature.** The approval reset, the approval and the swap are each simulated before the wallet is asked to sign. The panel shows what you'll receive according to the simulation. If Intercepta flags the transaction, it's held until the user picks **Cancel** or **Continue anyway**.

Where to find it:

| What | Code |
|---|---|
| API proxy that keeps the key on the server and caches token verdicts for 10 minutes | [`backend/intercepta.js`](backend/intercepta.js), routes at [`backend/server.js#L15-L16`](backend/server.js#L15-L16) |
| Extension background call to the proxy | [`extension/background.js#L22-L30`](extension/background.js#L22-L30) |
| Token risk check (`block` / `warn` / `info` and reasons) | [`extension/x-ticker-swap.js#L376-L385`](extension/x-ticker-swap.js#L376-L385) |
| Transaction simulation before signing | [`extension/x-ticker-swap.js#L390-L399`](extension/x-ticker-swap.js#L390-L399) |
| Blocked tokens disable Buy, and the verdict shown in the panel | [`extension/x-ticker-swap.js#L1133-L1160`](extension/x-ticker-swap.js#L1133-L1160) |
| Holding a flagged transaction until the user decides | [`extension/x-ticker-swap.js#L1217-L1232`](extension/x-ticker-swap.js#L1217-L1232) |
| Every transaction goes through the check before it's sent | [`extension/x-ticker-swap.js#L1236-L1246`](extension/x-ticker-swap.js#L1236-L1246) |

**Feedback on the Intercepta API**

- Token risk and transaction simulation return clear `action` values and readable detector descriptions, so we could show them to users without rewriting them.
- Token risk is on `/v2` and simulation on `/v1`, with different response shapes. One version would make the client simpler.
- Positive signals (`HIGH_REPUTATION_TOKEN`) come back in the same `detectors` list as risks, so we filter them out by code. A severity or polarity field would remove that guesswork.
- Transaction simulation doesn't cover every chain we swap on (Unichain is missing), so part of our flow has no simulation.

## World ID 🪪

Kickback authors prove with World ID (Proof of Human, IDKit v4) that they are one unique human, so one person can earn for only one X account. See [docs/world-id.md](docs/world-id.md) for why we chose this credential, the verification flow and its alternative paths, and our integration debrief.

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
