const express = require("express");
const cors = require("cors");
const path = require("path")

const app = express();

app.use(cors({
    origin: "*"
}))


app.get("/swap", (req, res) => {
    res.json({
        iframe: {
            html: `
            <h1>Swap DAI to USDC</h1><p>Swap tokens using Uniswap V2</p><input placeholder="Enter amount..." type="text" id="input"><p id="expectedOutputAmount"></p><button id="dugme">Swap</button>`,
            js: `
            const fromToken = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
            const fromDecimals = 18
            const toToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            const toDecimals = 6
            async function doSwap() {
      const amount = document.getElementById("input").value;
      const expectedOutputAmountP = document.getElementById("expectedOutputAmount");
      if (!amount) {
        expectedOutputAmountP.innerText = "Please enter an amount.";
        return;
      }

      // UniswapV2 Router contract address
      const uniswapV2RouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

      // ABI for UniswapV2 Router swapExactTokensForTokens function
      const swapExactTokensForTokensAbi = [{
        "constant": false,
        "inputs": [
          { "name": "amountIn", "type": "uint256" },
          { "name": "amountOutMin", "type": "uint256" },
          { "name": "path", "type": "address[]" },
          { "name": "to", "type": "address" },
          { "name": "deadline", "type": "uint256" }
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [{ "name": "", "type": "uint256[]" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }];

      try {
        // Connect to MetaMask
        await ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const fromAddress = await signer.getAddress();

        // Create contract instance
        const uniswapV2Router = new ethers.Contract(uniswapV2RouterAddress, swapExactTokensForTokensAbi, signer);

        // Convert amount to wei
        const amountInWei = ethers.utils.parseUnits(amount, fromDecimals);

        // Define the path for the swap
        const path = [fromToken, toToken];

        // Define the deadline (current time + 20 minutes)
        const deadline = Math.floor(Date.now() / 1000) + 1200;

        // Define amountOutMin as 0 for simplicity (should be set properly in production)
        const amountOutMin = 0;

        // Approve the router to spend the fromToken
        const fromTokenContract = new ethers.Contract(fromToken, [
          "function approve(address spender, uint256 amount) public returns (bool)"
        ], signer);
        const approvalTx = await fromTokenContract.approve(uniswapV2RouterAddress, amountInWei);
        await approvalTx.wait();

        // Execute the swap
        const swapTx = await uniswapV2Router.swapExactTokensForTokens(
          amountInWei,
          amountOutMin,
          path,
          fromAddress,
          deadline
        );
        const receipt = await swapTx.wait();

        // Update the UI
        expectedOutputAmountP.innerText = \`Transaction Sent! Hash: \${receipt.transactionHash}\`;
      } catch (error) {
        console.error(error);
        expectedOutputAmountP.innerText = \`Error: \${error.message}\`;
      }
    }

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

async function updateAmount(event) {
    const amount = this.value;
    const expectedOutputAmountP = document.getElementById("expectedOutputAmount");
    if (!amount) {
        expectedOutputAmountP.innerText = "";
        return;
    }

    // UniswapV2 Router contract address
    const uniswapV2RouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    // ABI for UniswapV2 Router (only the functions you need)
    const uniswapV2RouterAbi = [
        "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
    ];

    // Tokens
    const fromToken = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
    const toToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
    const fromDecimals = 18;
    const toDecimals = 6;

    try {
        // Connect to Ethereum using ethers.js and MetaMask provider
        await ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const uniswapV2Router = new ethers.Contract(uniswapV2RouterAddress, uniswapV2RouterAbi, signer);

        // Convert amount to wei
        const amountInWei = ethers.utils.parseUnits(amount, fromDecimals);

        // Define the path for the swap
        const path = [fromToken, toToken];

        // Get the expected output amount
        const amountsOut = await uniswapV2Router.getAmountsOut(amountInWei, path);
        const expectedOutputAmount = ethers.utils.formatUnits(amountsOut[1], toDecimals);

        // Update the UI
        expectedOutputAmountP.innerText = "Expected output amount " + expectedOutputAmount + " USDC";
    } catch (error) {
        console.error(error);
        expectedOutputAmountP.innerText = "Error fetching expected output amount";
    }
}

document.getElementById('dugme').addEventListener('click', doSwap);
document.getElementById('input').addEventListener('keyup', debounce(updateAmount, 200));
`
        }
    })
})

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