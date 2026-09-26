// Proxy for the Uniswap Trading API. Keeps the API key on the server, as Uniswap
// recommends, instead of shipping it inside the browser extension.
require('dotenv').config({ path: __dirname + '/.env' })

const UNISWAP_API_URL = 'https://trade-api.gateway.uniswap.org/v1'
const ALLOWED_ENDPOINTS = new Set(['check_approval', 'quote', 'swap'])

async function uniswapProxyCtrl(req, res) {
  const { endpoint } = req.params
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return res.status(404).json({ error: 'NotFound', message: `Unknown Uniswap endpoint: ${endpoint}` })
  }
  if (!process.env.UNISWAP_API_KEY) {
    return res.status(500).json({ error: 'MissingApiKey', message: 'UNISWAP_API_KEY is not set in backend/.env' })
  }

  try {
    const response = await fetch(`${UNISWAP_API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.UNISWAP_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(20000),
    })
    const text = await response.text()
    if (!response.ok) console.log(`Uniswap ${endpoint} ${response.status}: ${text.slice(0, 300)}`)
    res.status(response.status).type('application/json').send(text)
  } catch (error) {
    console.log(`Uniswap ${endpoint} failed:`, error)
    res.status(502).json({ error: 'UpstreamError', message: error.message })
  }
}

module.exports = { uniswapProxyCtrl }
