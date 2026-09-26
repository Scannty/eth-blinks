// Routes
const express = require('express')
const cors = require('cors')
const controllers = require('./controllers.js')
const { uniswapProxyCtrl } = require('./uniswap.js')
const app = express()
const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

app.get('/', controllers.helloWorldCtrl)
app.post('/generateEthTransferBlink', controllers.generateEthTransferBlinkCtrl)
app.post('/generateERC20TransferBlink', controllers.generateErc20TransferBlinkCtrl)
app.post('/storeToIpfs', controllers.storeToIpfsCtrl)
app.post('/uniswap/:endpoint', uniswapProxyCtrl)
// app.post('/generateBridgeBlink', controllers.generateTransferBlinkCtrl)
// app.post('/generateSwapBlink', controllers.generateTransferBlinkCtrl)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
