// Kickbacks: people who tweet a ticker earn a small fee when others buy it from their tweet.
// To earn, the tweet's author registers their X handle and a payout wallet, proving with
// World ID that they're a unique human (so bots can't farm kickbacks with spam accounts).
// The fee itself is charged by Uniswap (integratorFees on /quote), paid out in the bought token.
require('dotenv').config({ path: __dirname + '/.env' })
const fs = require('fs')
const path = require('path')
const { signRequest } = require('@worldcoin/idkit-core/signing')
const { hashSignal } = require('@worldcoin/idkit-core/hashing')

const KICKBACK_BIPS = 50 // 0.5% of what the buyer receives
const ACTION = process.env.WORLD_ACTION || 'earn-kickbacks'
const ENVIRONMENT = process.env.WORLD_ENVIRONMENT || 'staging' // "staging" works with simulator.worldcoin.org
const VERIFY_URL = 'https://developer.world.org/api/v4/verify'
const STORE_PATH = path.join(__dirname, 'data', 'kickbacks.json')
const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/

// { [handle lowercase]: { handle, wallet, nullifier, verifiedAt } }
let registry = {}
try {
  registry = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'))
} catch {}

function save() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true })
  fs.writeFileSync(STORE_PATH, JSON.stringify(registry, null, 2))
}

// The proof commits to the handle and wallet, so it can't be replayed to redirect someone's kickbacks
function signalFor(handle, wallet) {
  return `${handle.toLowerCase()}:${wallet.toLowerCase()}`
}

function missingConfig(res) {
  return res.status(503).json({
    error: 'MissingConfig',
    message: 'WORLD_APP_ID, WORLD_RP_ID and WORLD_RP_SIGNING_KEY must be set in blink-back-end/.env',
  })
}

function configured() {
  return process.env.WORLD_APP_ID && process.env.WORLD_RP_ID && process.env.WORLD_RP_SIGNING_KEY
}

// GET /kickbacks/:handle -> { handle, wallet, bips, verifiedAt }, or 404 if the handle hasn't verified
function getKickbackCtrl(req, res) {
  const entry = registry[String(req.params.handle).toLowerCase()]
  if (!entry) return res.status(404).json({ error: 'NotFound', message: 'Handle is not registered for kickbacks' })
  res.json({ handle: entry.handle, wallet: entry.wallet, bips: KICKBACK_BIPS, verifiedAt: entry.verifiedAt })
}

// POST /kickbacks/rp-context -> everything the client needs to open a World ID request
function rpContextCtrl(req, res) {
  if (!configured()) return missingConfig(res)
  const { sig, nonce, createdAt, expiresAt } = signRequest({ signingKeyHex: process.env.WORLD_RP_SIGNING_KEY, action: ACTION })
  res.json({
    app_id: process.env.WORLD_APP_ID,
    action: ACTION,
    environment: ENVIRONMENT,
    bips: KICKBACK_BIPS,
    rp_context: { rp_id: process.env.WORLD_RP_ID, nonce, created_at: createdAt, expires_at: expiresAt, signature: sig },
  })
}

// POST /kickbacks/register { handle, wallet, result } where result is IDKit's completion result, unmodified
async function registerCtrl(req, res) {
  const { handle, wallet, result } = req.body || {}
  if (!HANDLE_RE.test(handle || '') || !ADDRESS_RE.test(wallet || '') || !result || !Array.isArray(result.responses)) {
    return res.status(400).json({ error: 'BadRequest', message: 'Expected an X handle, a 0x wallet and a World ID result' })
  }
  if (!configured()) return missingConfig(res)

  const expectedSignal = hashSignal(signalFor(handle, wallet)).toLowerCase()
  if (result.action !== ACTION || !result.responses.length ||
      result.responses.some((r) => String(r.signal_hash || '').toLowerCase() !== expectedSignal)) {
    return res.status(400).json({ error: 'SignalMismatch', message: 'The World ID proof was made for a different handle, wallet or action' })
  }

  let verified
  try {
    const response = await fetch(`${VERIFY_URL}/${process.env.WORLD_RP_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Staging proofs are only accepted while a staging window is open in the Portal, with its token
        ...(process.env.WORLD_STAGING_TOKEN && { 'x-staging-verification-token': process.env.WORLD_STAGING_TOKEN }),
      },
      body: JSON.stringify(result),
      signal: AbortSignal.timeout(20000),
    })
    verified = await response.json()
    if (!response.ok || !verified.success) {
      console.log(`World ID verify ${response.status}:`, JSON.stringify(verified).slice(0, 300))
      return res.status(400).json({ error: verified.code || 'VerificationFailed', message: verified.detail || 'World ID verification failed' })
    }
  } catch (error) {
    console.log('World ID verify failed:', error)
    return res.status(502).json({ error: 'UpstreamError', message: error.message })
  }
  if (verified.environment && verified.environment !== ENVIRONMENT) {
    return res.status(400).json({ error: 'WrongEnvironment', message: `Expected a ${ENVIRONMENT} proof, got ${verified.environment}` })
  }

  // One human, one handle: the nullifier is the same every time this person proves this action
  const item = verified.results.find((r) => r.success && r.nullifier)
  if (!item) return res.status(400).json({ error: 'VerificationFailed', message: 'World ID returned no nullifier' })
  const nullifier = BigInt(item.nullifier).toString() // compare as a number, so hex casing can't matter
  const key = handle.toLowerCase()
  const ownedByHuman = Object.values(registry).find((entry) => entry.nullifier === nullifier)
  if (ownedByHuman && ownedByHuman.handle.toLowerCase() !== key) {
    return res.status(409).json({ error: 'AlreadyRegistered', message: `This World ID already earns kickbacks as @${ownedByHuman.handle}` })
  }
  if (registry[key] && registry[key].nullifier !== nullifier) {
    return res.status(409).json({ error: 'HandleTaken', message: `@${handle} is already registered by another human` })
  }

  // Same human re-verifying their own handle may change the payout wallet
  registry[key] = { handle, wallet, nullifier, verifiedAt: new Date().toISOString() }
  save()
  res.json({ handle, wallet, bips: KICKBACK_BIPS })
}

module.exports = { getKickbackCtrl, rpContextCtrl, registerCtrl }
