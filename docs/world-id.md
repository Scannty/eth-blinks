# World ID Integration 🪪

Kickbacks pay tweet authors 0.5% of every buy made from their ticker card, so the reward invites farming with many X accounts. Before an account can earn, the author proves with World ID (Proof of Human, IDKit v4) that they are one unique human. The backend verifies the proof and stores the nullifier, so one human can earn for only one X account.

## Verification flow

1. On their own tweet, the author clicks **Verify with World ID** under the ticker card. This opens `extension/kickbacks.html` with their X handle and connected wallet.
2. The page asks the backend for an RP context (`POST /kickbacks/rp-context`), signed with the RP signing key that never leaves the server.
3. IDKit builds a Proof of Human request whose signal is `handle:wallet`, and the page shows it as a QR code for World App (or the simulator in staging).
4. The page sends the proof unmodified to `POST /kickbacks/register`. The backend checks the signal and action, verifies the proof with `developer.world.org/api/v4/verify`, checks the environment, and stores the nullifier with the handle and wallet.
5. From then on, buys from that author's ticker cards include a 0.5% Uniswap integrator fee to their wallet.

## Alternative paths

| Case | What the author sees |
|---|---|
| Declines the request in World App | "You declined the request in World App. Nothing was shared." and the form resets |
| Clicks cancel on the QR step | Back to the form. The proof, if one still arrives, is ignored |
| World ID without Proof of Human | Told kickbacks need an Orb-verified World ID, and to verify at an Orb and try again |
| Same human tries a second X handle | Backend returns `409 AlreadyRegistered`: "This World ID already earns kickbacks as @handle" |
| A different human tries a registered handle | Backend returns `409 HandleTaken` |
| Proof made for another handle, wallet or action | Backend returns `400 SignalMismatch` |
| Timeout or connection failure | Asked to try again |

The same human verifying their own handle again can change the payout wallet.

## Why Proof of Human is the minimum sufficient credential

The event that needs trust is an author registering an X handle and payout wallet to earn kickbacks. The risk is sybil farming: one person creating many X accounts, tweeting tickers from all of them, and collecting a fee on each. The only property that stops this is *uniqueness*: this account belongs to a person who hasn't already registered another one.

- **Anything weaker doesn't stop the attack.** A wallet, an email, a phone number or an X account can each be created many times by one person. None of them proves uniqueness, so they would only raise the cost of farming, not prevent it.
- **Anything stronger asks for more than we need.** Document credentials (passport, age, nationality) would tell us who the author is or where they live. Kickbacks don't depend on any of that, so collecting it would only add privacy risk and exclude people without the document.
- **Nothing reusable leaves World ID.** The nullifier is scoped to our `earn-kickbacks` action, so it can't link the author across other apps. The proof's signal commits to `handle:wallet`, so it can't be replayed to redirect someone's payouts. We store only the handle, wallet and nullifier.

## Integration debrief

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
