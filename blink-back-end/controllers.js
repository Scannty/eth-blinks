const pinataSdk = require('@pinata/sdk')
require('dotenv').config({ path: __dirname + '/.env' })

const pinata = new pinataSdk(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY)

async function helloWorldCtrl(req, res, next) {
  console.log(process.env.PINATA_API_KEY)
  console.log(await pinata.testAuthentication())
  res.send('Hello World')
  next()
}

async function publishToIPFS(iframe) {
  try {
    const ipfsFile = await pinata.pinJSONToIPFS({ iframe })
    console.log(ipfsFile.IpfsHash)
    return ipfsFile.IpfsHash
  } catch (error) {
    console.log(error)
  }
}

const makeid = () => {
  return Math.floor(Math.random() * 100000000)
}

async function storeToIpfsCtrl(req, res, next) {
  const iframe = req.body
  try {
    const ipfsFile = await pinata.pinJSONToIPFS(iframe)
    console.log(ipfsFile.IpfsHash)
    res.send(ipfsFile.IpfsHash)
  } catch (error) {
    console.log(error)
    res.send('Error')
  }
  next()
}

async function generateEthTransferBlinkCtrl(req, res, next) {
  // 1) Generate HTML for Transfer Blink
  const id = makeid() // Da ne bi bagovalo sa dva ista tvita koji linkuju ka ovom blinku
  const iframe = {
    html: `
    <h1>Send ether</h1>
    <p>Send 1 ether to the following address:</p>
    <input placeholder="Type the address..." value="0x679a9aa509A85EeA7912D76d85b0b9195972B211" type="text" id="input${id}">
    <button id="dugme${id}">Send ether</button>`,
    js: `
console.log('Dobar eval')
async function showAlert() {
    const recipient = document.getElementById("input${id}").value;
    console.log(window.ethereum);
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const publicKey = accounts[0];
            // Specify the amount of Ether to send (in Wei)
            const amount = "0x" + (1e18).toString(16)
            // Transaction parameters
            const transactionParameters = {
                to: recipient,
                from: publicKey,
                value: amount,
            };
            console.log(transactionParameters)
            // Send the transaction
            const txHash = await ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
            alert(\`Transaction Sent! Hash: \${txHash}\`);
            // Check the transaction status
            const checkTransactionStatus = async (hash) => {
                const receipt = await ethereum.request({
                    method: 'eth_getTransactionReceipt',
                    params: [hash],
                });
                if (receipt && receipt.blockNumber) {
                    alert('Transaction Completed!');
                } else {
                    setTimeout(() => checkTransactionStatus(hash), 1000);
                }
            };
            checkTransactionStatus(txHash);
        } catch (error) {
            alert(\`Error: \${error.message}\`);
        }
    } else {
        alert('MetaMask is not installed');
    }
}
document.getElementById('dugme${id}').addEventListener('click', showAlert);
`,
  }
  // 2) Store the HTML on IPFS
  let cid
  try {
    cid = await publishToIPFS(iframe)
    console.log(`Transfer Blink published to IPFS with CID: ${cid}`)
  } catch (error) {
    console.log(error)
  }

  // 3) Send the IPFS link to the user
  const ipfsLink = `https://gateway.ipfs.io/ipfs/${cid}`
  res.send('Transfer   Blink generated. Check it out at: ' + ipfsLink)

  next()
}

async function generateErc20TransferBlinkCtrl(req, res, next) {
  // 1) Generate HTML for Transfer Blink
  const iframe = {
    html: `
      <style>
      #naslovce {
          color: #FF0000;
      }
      </style>
      <h1 id="naslovce">Send ERC-20 Token</h1><p>Send tokens to the following address:</p>
      <input placeholder="Type the address..." value="0x679a9aa509A85EeA7912D76d85b0b9195972B211" type="text" id="inputAddress">
      <input placeholder="Type the token amount..." type="number" id="inputAmount">
      <button id="dugme">Send Token</button>`,
    js: `
console.log('ERC-20 Token Transfer');
async function showAlert() {
  const recipient = document.getElementById("inputAddress").value;
  const amount = document.getElementById("inputAmount").value;
  const tokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // replace with token address
  const decimals = 18; // replace with token decimals
  if (typeof window.ethereum !== 'undefined'  ) {
      try {
          const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
          const publicKey = accounts[0];
          const amountToSend = (amount * Math.pow(10, decimals)).toString(16);
          console.log(amountToSend);
          const data = "0xa9059cbb" + recipient.substring(2).padStart(64, '0') + amountToSend.padStart(64, '0');
          const transactionParameters = {
              to: tokenAddress,
              from: publicKey,
              data: data,
          };
          console.log(transactionParameters);
          const txHash = await ethereum.request({
              method: 'eth_sendTransaction',
              params: [transactionParameters],
          });
          alert(\`Transaction Sent! Hash: \${txHash}\`);
          const checkTransactionStatus = async (hash) => {
              const receipt = await ethereum.request({
                  method: 'eth_getTransactionReceipt',
                  params: [hash],
              });
              if (receipt && receipt.blockNumber) {
                  alert('Transaction Completed!');
              } else {
                  setTimeout(() => checkTransactionStatus(hash), 1000);
              }
          };
          checkTransactionStatus(txHash);
      } catch (error) {
          alert(\`Error: \${error.message}\`);
      }
  } else {
      alert('MetaMask is not installed');
  }
}
document.getElementById('dugme').addEventListener('click', showAlert);
`,
  }
  // 2) Store the HTML on IPFS
  let cid
  try {
    cid = await publishToIPFS(iframe)
    console.log(`ERC 20 Transfer Blink published to IPFS with CID: ${cid}`)
  } catch (error) {
    console.log(error)
  }
}
module.exports = { helloWorldCtrl, generateEthTransferBlinkCtrl, generateErc20TransferBlinkCtrl, storeToIpfsCtrl }
