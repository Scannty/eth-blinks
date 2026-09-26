# Uniswap Developer Feedback

XSwap lets people buy a token from its ticker card on X without leaving the timeline. Every quote and swap goes through the Uniswap Trading API (`check_approval`, `quote`, `swap`) over v2, v3 and v4 pools on Base, Ethereum, Arbitrum, Optimism and Unichain. We also use `integratorFees` to pay 0.5% of each buy to the author of the tweet it came from. See the [README](README.md#uniswap-integration-) for links to the code.

## Time to first success

About 2 hours from getting an API key to the first real swap landing onchain. The Trading API worked well and the integration went smoothly; the points below are small things we had to work out along the way.

## What worked well

- The three-call flow (`check_approval` → `quote` → `swap`) maps cleanly onto a swap UI. We didn't need to touch the Universal Router or pick pools ourselves.
- `integratorFees` made creator kickbacks possible with one extra field on the quote. The fee is paid in the same transaction, so we don't hold funds or run a payout job.
- One API across five chains. Adding a chain was only a matter of adding token addresses.

## Friction we hit

- **Permit2 data isn't ready to sign.** `permitData` from `/quote` has `domain`, `types` and `values`, but `eth_signTypedData_v4` also needs an `EIP712Domain` type and a `primaryType`. We rebuild both ourselves ([`typedDataFromPermit`](extension/x-ticker-swap.js#L338-L346)). A signing-ready payload, or a documented snippet, would save every non-viem integrator this step.
- **With an integrator fee, `quote.output` includes the fee.** The amount the buyer actually receives is in `aggregatedOutputs`, in the entry without a `fee` field ([`quoteOutputs`](extension/x-ticker-swap.js#L327-L335)). Showing `output` naively overstates what the user gets.
- **`check_approval` can return a `cancel` transaction** that has to be sent before the approval (for tokens like USDT that need the allowance reset to zero first). This is easy to miss if you only handle `approval`.
- **Quotes need a `swapper` address before the user connects a wallet.** To show live prices on the card before connecting, we quote with a placeholder address and quote again with the real wallet before swapping.
- **The API key can't live in a browser extension.** Anything shipped in an extension is public, so we added a small backend proxy just to hold the key ([`backend/uniswap.js`](backend/uniswap.js)).
- **Error codes for "no route".** We match both `NoRouteFoundError` and `NoQuotesAvailable` to show one "No Uniswap route" message. A documented list of error codes would help.

## Missing capability or documentation

- A guide for integrator fees: how `aggregatedOutputs` changes, what the fee limits are, and which token the fee is paid in.
- A way to use the API from client-only apps (browser extensions, static sites) without running a backend, for example domain- or origin-scoped keys.

## The one improvement with the greatest impact

Return `permitData` as a complete EIP-712 payload (with `EIP712Domain` and `primaryType`) so it can be passed straight to `eth_signTypedData_v4`. Every integrator that signs with a raw wallet provider instead of viem has to rebuild this by hand, and it is easy to get wrong.
