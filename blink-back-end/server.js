// Routes
import express from 'express'
import controllers from './controllers.js'
const app = express()
const port = 3000

app.get('/', controllers.helloWorldCtrl)
app.post('/generateTransferBlink', controllers.generateTransferBlinkCtrl)
// app.post('/generateAdBlink', controllers.generateTransferBlinkCtrl)
// app.post('/generateBridgeBlink', controllers.generateTransferBlinkCtrl)
// app.post('/generateSwapBlink', controllers.generateTransferBlinkCtrl)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
