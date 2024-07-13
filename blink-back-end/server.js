// Routes
const express = require('express')
const controllers = require('./controllers.js')
const app = express()
const port = 3000

app.get('/', controllers.helloWorldCtrl)
app.post('/generateEthTransferBlink', controllers.generateEthTransferBlinkCtrl)
app.post('/generateERC20TransferBlink', controllers.generateErc20TransferBlinkCtrl)
// app.post('/generateBridgeBlink', controllers.generateTransferBlinkCtrl)
// app.post('/generateSwapBlink', controllers.generateTransferBlinkCtrl)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
