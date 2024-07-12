import pinataSdk from '@pinata/sdk'
import 'dotenv/config'

const pinata = new pinataSdk(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY)

async function helloWorldCtrl(req, res, next) {
  console.log(await pinata.testAuthentication())
  res.send('Hello World')
  next()
}

async function publishToIPFS(html) {
  try {
    const ipfsFile = await pinata.pinJSONToIPFS({ html })
    console.log(ipfsFile.IpfsHash)
    return ipfsFile.IpfsHash
  } catch (error) {
    console.log(error)
  }
}

async function generateTransferBlinkCtrl(req, res, next) {
  // 1) Generate HTML for Transfer Blink
  const html = `
    <html>
      <head>
        <title>Transfer Blink</title>
      </head>
      <body>
        <h1>Transfer Blink</h1>
        <p>Transfer Blink is a simple, secure, and private way to send money to anyone in the world.</p>
        <p>Powered by IPFSssssss.</p>
      </body>
    </html>
  `
  // 2) Store the HTML on IPFS
  let cid
  try {
    cid = await publishToIPFS(html)
    console.log(`Transfer Blink published to IPFS with CID: ${cid}`)
  } catch (error) {
    console.log(error)
  }

  // 3) Send the IPFS link to the user
  const ipfsLink = `https://gateway.ipfs.io/ipfs/${cid}`
  res.send('Transfer Blink generated. Check it out at: ' + ipfsLink)

  next()
}

export default { helloWorldCtrl, generateTransferBlinkCtrl }
