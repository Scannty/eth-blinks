// Routes
const express = require('express')
const cors = require('cors')
const { uniswapProxyCtrl } = require('./uniswap.js')
const { interceptaTokenCtrl, interceptaTransactionCtrl } = require('./intercepta.js')
const { getKickbackCtrl, rpContextCtrl, registerCtrl } = require('./kickbacks.js')
const app = express()
const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('XSwap backend OK'))
app.post('/uniswap/:endpoint', uniswapProxyCtrl)
app.get('/intercepta/token/:chainId/:address', interceptaTokenCtrl)
app.post('/intercepta/transaction/:chainId', interceptaTransactionCtrl)
app.post('/kickbacks/rp-context', rpContextCtrl)
app.post('/kickbacks/register', registerCtrl)
app.get('/kickbacks/:handle', getKickbackCtrl)

app.listen(port, () => {
  console.log(`XSwap backend listening on port ${port}`)
})
