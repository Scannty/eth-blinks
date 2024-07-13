const express = require("express");
const cors = require("cors");
const path = require("path")

const app = express();

app.use(cors({
    origin: "*"
}))

app.get("/blink", (req, res) => {
    res.json({
        iframe: {
            html: `
            <style>
            #naslovce {
                color: #FF0000;
            }
            </style>
            <h1 id="naslovce">Send ether</h1><p>Send 1 ether to the following address:</p><input placeholder="Type the address..." value="0x679a9aa509A85EeA7912D76d85b0b9195972B211" type="text" id="input"><button id="dugme">Send ether</button>`,
            js: `
console.log('Dobar eval')
async function showAlert() {
    const recipient = document.getElementById("input").value;

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

document.getElementById('dugme').addEventListener('click', showAlert);
`
        }
    })
})

app.get("/blink-erc20", (req, res) => {
    res.json({
      iframe: {
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
      },
    });
  });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "test.html"));
})

app.listen(80)