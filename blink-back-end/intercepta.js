// Proxy for the Intercepta (Web3 Antivirus) security API. Keeps the API key on the server,
// like the Uniswap proxy, and caches token verdicts so every rendered card doesn't spend credits.
require('dotenv').config({ path: __dirname + '/.env' })

const INTERCEPTA_API_URL = 'https://api.web3antivirus.io/api/public'
const TOKEN_CACHE_MS = 10 * 60 * 1000
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/
const CHAIN_ID_RE = /^\d{1,10}$/

const tokenCache = new Map() // `${chainId}:${address}` -> { expires, status, body }

async function interceptaFetch(path, options = {}) {
  const response = await fetch(`${INTERCEPTA_API_URL}${path}`, {
    ...options,
    headers: {
      'X-API-KEY': process.env.INTERCEPTA_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(20000),
  })
  const text = await response.text()
  if (!response.ok) console.log(`Intercepta ${path} ${response.status}: ${text.slice(0, 300)}`)
  return { status: response.status, ok: response.ok, text }
}

function missingKey(res) {
  return res.status(503).json({ error: 'MissingApiKey', message: 'INTERCEPTA_API_KEY is not set in blink-back-end/.env' })
}

// GET /intercepta/token/:chainId/:address -> token risk verdict (riskLevel, action, detectors, taxes)
async function interceptaTokenCtrl(req, res) {
  const { chainId, address } = req.params
  if (!CHAIN_ID_RE.test(chainId) || !ADDRESS_RE.test(address)) {
    return res.status(400).json({ error: 'BadRequest', message: 'Expected a numeric chainId and a 0x address' })
  }
  if (!process.env.INTERCEPTA_API_KEY) return missingKey(res)

  const key = `${chainId}:${address.toLowerCase()}`
  const cached = tokenCache.get(key)
  if (cached && cached.expires > Date.now()) return res.status(cached.status).type('application/json').send(cached.body)

  try {
    const { status, ok, text } = await interceptaFetch(
      `/v2/extension/token-intelligence/token/${address}/risks?chainId=${chainId}`
    )
    if (ok) tokenCache.set(key, { expires: Date.now() + TOKEN_CACHE_MS, status, body: text })
    res.status(status).type('application/json').send(text)
  } catch (error) {
    console.log('Intercepta token scan failed:', error)
    res.status(502).json({ error: 'UpstreamError', message: error.message })
  }
}

// POST /intercepta/transaction/:chainId { transaction: { from, to, data, value } } -> simulation + detectors
async function interceptaTransactionCtrl(req, res) {
  const { chainId } = req.params
  const tx = req.body && req.body.transaction
  if (!CHAIN_ID_RE.test(chainId) || !tx || !ADDRESS_RE.test(tx.from || '') || !ADDRESS_RE.test(tx.to || '')) {
    return res.status(400).json({ error: 'BadRequest', message: 'Expected a numeric chainId and a transaction with from/to' })
  }
  if (!process.env.INTERCEPTA_API_KEY) return missingKey(res)

  try {
    const { status, text } = await interceptaFetch(`/v1/extension/simulation/transaction?chainId=${chainId}`, {
      method: 'POST',
      body: JSON.stringify({
        transaction: { from: tx.from, to: tx.to, data: tx.data || '0x', value: tx.value || '0x0' },
        mode: 'short',
      }),
    })
    res.status(status).type('application/json').send(text)
  } catch (error) {
    console.log('Intercepta transaction scan failed:', error)
    res.status(502).json({ error: 'UpstreamError', message: error.message })
  }
}

module.exports = { interceptaTokenCtrl, interceptaTransactionCtrl }
