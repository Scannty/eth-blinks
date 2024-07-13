const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.get('/swap', (req, res) => {
  //return res.json({iframe: {html: "", js: ""}});
  res.json({
    iframe: {
      html: `
        <style>
          #dugme {
            text-align: center;
          }
        
          .swap-naslovcek {
              margin-top: -45px;
              text-align: center;
          }
          .swap-card {
            background-color: white;
            border-radius: 15px;
            padding: 10px;
            width: 94%;
            margin: auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            align-self: center;
            max-width: 600px;
            max-height: 510px;
            min-height: 420px;
            margin-top: -50px;
          }
          #referrerWarning {
            text-align: center;
            margin-top: -40px;
            background-color: lightpink;
            margin-right: 20%;
            margin-left: 20%;
            border-radius: 4px;
          }
          .swap-content {
          
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f7f9fa;
            border-radius: 12px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .swap-row {
            width: 100%;
            display: flex;
            gap: 10px;
            align-items: center;
          }
          .swap-select-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            flex: 1;
          }
          .select-label {
            font-size: 12px;
            color: #555;
            margin-bottom: 3px;
          }
          .input{
            width: 100%;
          }
          .input, .select {
            display: flex;
            align-items: center;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 5px;
            flex: 1;
          }
          .input img, .select img {
            width: 24px;
            height: 24px;
            margin-right: 8px;
          }
          input, select {
            border: none;
            background-color: transparent;
            font-size: 14px;
            width: 100%;
            padding: 5px;
          }
          select {
            appearance: none;
            -moz-appearance: none;
            -webkit-appearance: none;
            background: transparent;
            cursor: pointer;
          }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
          @keyframes gradient-animation {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
          button {
            background-color: #1da1f2;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.3s ease;
          }
          button:disabled {
            cursor: not-allowed;
          }
          button.loading {
            background-image: linear-gradient(
              90deg,
              #0099ff 0%, /* Brighter blue */
              #ff66cc 50%, /* Vibrant pink for contrast */
              #0099ff 100% /* Brighter blue */
            );
            background-size: 200% 100%;
            animation: gradient-animation 1s linear infinite; /* Increase speed to 1s */
          }
            button.success {
            background-color: #4CAF50;
          }
          .swap-checkmark {
            color: white;
            font-size: 24px;
            margin-right: 8px;
          }
            .my-banner{
              width: 70%;
              display: flex;
              flex-direction: row;
              justify-content: space-around;
              align-items: center;
              margin: auto;
              margin-top: -10px;
              margin-bottom: -10px;
            }
            #expectedOutputAmount{
              text-align: center;
            }

        </style>
        <div class="swap-card">
          <p class="swap-naslovcek" id="naslovchek">Loading...</p>
          <p id="referrerWarning">Note: Referer gets a cut. </p>
          <div class="my-banner">
            <img
              width="120px"
              height="120px"
              src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
              alt="Coin logo"
            />
            <img
              width="120px"
              height="120px"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Uniswap_Logo.svg/2051px-Uniswap_Logo.svg.png"
              alt="Uniswap logo"
            />
          </div>
          <div class="swap-content">
            <div class="swap-row">
              <div class="swap-select-container">
                <div class="select-label">From Token</div>
                <div class="select">
                  <img
                    src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
                    alt="From Token"
                  />
                  <select id="fromTokenS">
                    <option id="tokenDAI" value="DAI">DAI</option>
                    <option id="tokenWETH" value="WETH">WETH</option>
                    <option id="tokenUSDC" value="USDC">USDC</option>
                    <option id="tokenWBTC" value="WBTC">WBTC</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="input">
              <img
                src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                alt="USDC"
              />
              <input id="input" type="number" placeholder="Input token amount" />
            </div>
            <p id="expectedOutputAmount"></p>
            <button id="dugme">Buy USDC</button>
          </div>
        </div>
      `,
      js: `
        if(typeof destinationToken === 'undefined')
          var destinationToken;
        destinationToken = { // HARDCODE BY GENERATOR
            name: "USDC",
            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            decimals: 6,
            image: "https://cdn3d.iconscout.com/3d/premium/thumb/usdc-10229270-8263869.png?f=webp"
        }

        if(destinationToken.address=='0x6B175474E89094C44Da98b954EedeAC495271d0F')
          document.getElementById("tokenDAI")?.parentNode.removeChild(document.getElementById("tokenDAI"));
        if(destinationToken.address=='0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
            document.getElementById("tokenWETH")?.parentNode.removeChild(document.getElementById("tokenWETH"));
        if(destinationToken.address=='0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
            document.getElementById("tokenUSDC")?.parentNode.removeChild(document.getElementById("tokenUSDC"));
        if(destinationToken.address=='0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599')
            document.getElementById("tokenWBTC")?.parentNode.removeChild(document.getElementById("tokenWBTC"));

        if(typeof sourceTokens === 'undefined')
          var sourceTokens;

        sourceTokens = {
          "DAI": {
            address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            decimals: 18
          },
          "WETH": {
            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            decimals: 18
          },
          "USDC": {
            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            decimals: 6
          },
          "WBTC": {
            address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            decimals: 8
          },
        }
        if(typeof referrer === 'undefined')
          var referrer;
        referrer = null
        if(!referrer){
            document.getElementById("referrerWarning").style.display = 'none';
        }

        document.getElementById("naslovchek").innerHTML = "Buy "+ destinationToken.name + " on UniswapV2";
        console.log('USDC Bridge');
        document.getElementById("fromTokenS").addEventListener('click', function(event) {
          event.stopPropagation();
        });

        async function doSwap() {
          const dugme = document.getElementById("dugme")
          const amount = document.getElementById("input").value;
          const expectedOutputAmountP = document.getElementById("expectedOutputAmount");
          if (!amount) {
            expectedOutputAmountP.innerText = "Please enter an amount.";
            return;
          }

          // UniswapV2 Router contract address
          const uniswapV2RouterAddress = "0x83eafF3C19083B03A8E0708F7637D0c4638E9FC9";

          // ABI for UniswapV2 Router swapExactTokensForTokens function
          const swapExactTokensForTokensAbi = [
            {
              "type": "constructor",
              "inputs": [
                {
                  "name": "router",
                  "type": "address",
                  "internalType": "contract IUniswapV2Router"
                }
              ],
              "stateMutability": "nonpayable"
            },
            {
              "type": "function",
              "name": "swapWithReferral",
              "inputs": [
                {
                  "name": "referrer",
                  "type": "address",
                  "internalType": "address"
                },
                {
                  "name": "amountIn",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "amountOutMin",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "path",
                  "type": "address[]",
                  "internalType": "address[]"
                },
                {
                  "name": "",
                  "type": "address",
                  "internalType": "address"
                },
                {
                  "name": "deadline",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ],
              "outputs": [
                {
                  "name": "amounts",
                  "type": "uint256[]",
                  "internalType": "uint256[]"
                }
              ],
              "stateMutability": "nonpayable"
            },
            {
              "type": "event",
              "name": "ReferralShare",
              "inputs": [
                {
                  "name": "amount",
                  "type": "uint256",
                  "indexed": false,
                  "internalType": "uint256"
                },
                {
                  "name": "referrer",
                  "type": "address",
                  "indexed": false,
                  "internalType": "address"
                },
                {
                  "name": "referee",
                  "type": "address",
                  "indexed": false,
                  "internalType": "address"
                },
                {
                  "name": "timestamp",
                  "type": "uint256",
                  "indexed": false,
                  "internalType": "uint256"
                }
              ],
              "anonymous": false
            }
          ];

          try {
            const selectedTokenName = document.getElementById("fromTokenS").value;
            const selectedToken = sourceTokens[selectedTokenName];
            const fromToken = selectedToken.address;
            const fromDecimals = selectedToken.decimals;
            dugme.disabled = true;
            dugme.classList.add('loading');
            dugme.innerHTML = 'Executing swap...';

            await ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const fromAddress = await signer.getAddress();
            const uniswapV2Router = new ethers.Contract(uniswapV2RouterAddress, swapExactTokensForTokensAbi, signer);
            const amountInWei = ethers.utils.parseUnits(amount, fromDecimals);
            console.log("OVOLIKO USDT")
            console.log(amountInWei)
            const path = [fromToken, destinationToken.address];
            const deadline = Math.floor(Date.now() / 1000) + 1200;
            const amountOutMin = 0;
            const fromTokenContract = new ethers.Contract(fromToken, [
              "function approve(address spender, uint256 amount) public returns (bool)"
            ], signer);
            const approvalTx = await fromTokenContract.approve(uniswapV2RouterAddress, amountInWei);
            await approvalTx.wait();

            const swapTx = await uniswapV2Router.swapWithReferral(
              referrer || "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
              amountInWei,
              amountOutMin,
              path,
              "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
              deadline
            );
            const receipt = await swapTx.wait();

            
            dugme.classList.remove('loading');
            dugme.classList.add('success');
            dugme.innerHTML = '<span class="swap-checkmark">✓</span> Swap Successful';

            setTimeout(() => {
              dugme.disabled = false;
              dugme.classList.remove('success');
              dugme.innerHTML = 'Buy USDC';
            }, 3000);
          } catch (error) {
            console.error(error);
            expectedOutputAmountP.innerText = \`Error: \${error.message}\`;
            
            dugme.disabled = false;
            dugme.classList.remove('loading');
            dugme.innerHTML = 'Buy USDC';
          }

        }

        function debounce(func, delay) {

        if(document.getElementById("input").value){
            const expectedOutputAmountP = document.getElementById("expectedOutputAmount");
            expectedOutputAmountP.innerText = "Getting a quote...";
        }

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
            expectedOutputAmountP.innerText = "Getting a quote...";

            // UniswapV2 Router contract address
            const uniswapV2RouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

            // ABI for UniswapV2 Router (only the functions you need)
            const uniswapV2RouterAbi = [
                "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
            ];

            // Tokens
            const selectedTokenName = document.getElementById("fromTokenS").value;
            const selectedToken = sourceTokens[selectedTokenName];
            const fromToken = selectedToken.address;
            const fromDecimals = selectedToken.decimals;

            try {
                // Connect to Ethereum using ethers.js and MetaMask provider
                await ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const uniswapV2Router = new ethers.Contract(uniswapV2RouterAddress, uniswapV2RouterAbi, signer);

                // Convert amount to wei
                const amountInWei = ethers.utils.parseUnits(amount, fromDecimals);

                // Define the path for the swap
                const path = [fromToken, destinationToken.address];

                // Get the expected output amount
                const amountsOut = await uniswapV2Router.getAmountsOut(amountInWei, path);
                const expectedOutputAmount = ethers.utils.formatUnits(amountsOut[1], destinationToken.decimals);

                // Update the UI
                expectedOutputAmountP.innerText = "~" + expectedOutputAmount + " USDC";
            } catch (error) {
                console.error(error);
                expectedOutputAmountP.innerText = "Error fetching expected output amount";
            }
        }

        document.getElementById("dugme").addEventListener('click', doSwap);
        document.getElementById("input").addEventListener('keyup', debounce(updateAmount, 200));
      `,
    },
  })
})

<<<<<<< Updated upstream
app.get('/blink', (req, res) => {
  return res.json({ iframe: { html: '', js: '' } })
=======
app.get("/blink", (req, res) => {
  return res.json({ iframe: { html: "", js: "" } });
>>>>>>> Stashed changes
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

document.getElementById("dugme").addEventListener('click', showAlert);
`,
    },
  });
});

<<<<<<< Updated upstream
app.get('/blink-erc20', (req, res) => {
  return res.json({ iframe: { html: '', js: '' } })
=======
app.get("/blink-erc20", (req, res) => {
  return res.json({ iframe: { html: "", js: "" } });
>>>>>>> Stashed changes
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

app.get("/bridge", (req, res) => {
  //return res.json({iframe: {html: "", js: ""}});
  res.json({
    iframe: {
      html: `
        <style>
          .bridge-card {
            background-color: white;
            border-radius: 15px;
            padding: 10px;
            width: 100%;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            align-self: center;
            max-width: 600px;
          }
          .bridge-card img {
            width: 100%;
            height: auto;
            max-height: 250px;
            object-fit: contain;
            border-radius: 12px;
            margin-bottom: 10px;
          }
          .bridge-content {
            background-color: #f7f9fa;
            border-radius: 12px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .bridge-row {
            display: flex;
            gap: 10px;
            align-items: center;
          }
          .bridge-select-container {
            display: flex;
            flex-direction: column;
            flex: 1;
          }
          .bridge-select-label {
            font-size: 12px;
            color: #555;
            margin-bottom: 3px;
          }
          .bridge-input, .bridge-select {
            display: flex;
            align-items: center;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 5px;
            flex: 1;
          }
          .bridge-input img, .bridge-select img {
            width: 24px;
            height: 24px;
            margin-right: 8px;
          }
          input, select {
            border: none;
            background-color: transparent;
            font-size: 14px;
            width: 100%;
            padding: 5px;
          }
          select {
            appearance: none;
            -moz-appearance: none;
            -webkit-appearance: none;
            background: transparent;
            cursor: pointer;
          }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
          @keyframes gradient-animation {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
          button {
            background-color: #1da1f2;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          button:disabled {
            cursor: not-allowed;
          }
          button.loading {
            background-image: linear-gradient(
              90deg,
              #0099ff 0%,
              #ff66cc 50%,
              #0099ff 100%
            );
            background-size: 200% 100%;
            animation: gradient-animation 1s linear infinite;
          }
          button.success {
            background-color: #4CAF50;
          }
          .checkmark {
            color: white;
            font-size: 24px;
            margin-right: 8px;
          }
        </style>
        <div class="bridge-card">
          <img
            src="https://zengo.com/wp-content/uploads/USDC-to-Chainlink.png"
            alt="Bridge USDC"
          />
          <div class="bridge-content">
            <div class="bridge-row">
              <div class="bridge-select-container">
                <div class="bridge-select-label">From Network</div>
                <div class="bridge-select">
                  <img
                    src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
                    alt="From Network"
                  />
                  <select id="fromNetwork">
                    <option value="eth">Ethereum</option>
                    <option value="avax">Avalanche</option>
                    <option value="bsc">Binance Smart Chain</option>
                  </select>
                </div>
              </div>
              <div class="bridge-select-container">
                <div class="bridge-select-label">To Network</div>
                <div class="bridge-select">
                  <img
                    src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
                    alt="To Network"
                  />
                  <select id="toNetwork">
                    <option value="eth">Ethereum</option>
                    <option value="avax">Avalanche</option>
                    <option value="bsc">Binance Smart Chain</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="bridge-input">
              <img
                src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                alt="USDC"
              />
              <input id="amountInput" type="number" placeholder="Amount" />
            </div>
            <button id="bridgeButton">Bridge USDC</button>
          </div>
        </div>
      `,
      js: `
        console.log('USDC Bridge');
        document.getElementById('fromNetwork').addEventListener('click', function(event) {
          event.stopPropagation();
        });
        document.getElementById('toNetwork').addEventListener('click', function(event) {
          event.stopPropagation();
        });
        document.getElementById('bridgeButton').addEventListener('click', async () => {
          const button = document.getElementById('bridgeButton');
          await ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          console.log(signer);
          const fromNetwork = document.getElementById('fromNetwork').value;
          const toNetwork = "4949039107694359620";
          const amount = document.getElementById('amountInput').value;
          console.log(amount);
          const bridgeContractAddress = "0x462B15Cd62644191a7d91793b2dC539Ad9a50207";
          const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
          const decimals = 6 // replace with token decimals
          const amountToSend = "0x"+(amount * Math.pow(10, decimals)).toString(16)
          console.log("Amount to Send:", amountToSend);
          // first transfer USDC amount to the bridge contract, below is code
          const usdcContract = new ethers.Contract(usdcAddress, ["function transfer(address to, uint256 amount) public"], signer);
          await usdcContract.transfer(bridgeContractAddress, amountToSend);
          // then call the bridge function with  function transferTokensPayNative(
          const bridgeContract = new ethers.Contract(bridgeContractAddress, ["function transferTokensPayNative(uint64 _destinationChainSelector, address _receiver, address _token, uint256 _amount) public"], signer);
          await bridgeContract.transferTokensPayNative(toNetwork, await signer.getAddress(), usdcAddress, amountToSend);
          // Disable the button and add loading class
          button.disabled = true;
          button.classList.add('loading');
          button.innerHTML = 'Bridging...';
      
          // Simulate a delay for the bridging process
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
      
          // Show success message
          button.classList.remove('loading');
          button.classList.add('success');
          button.innerHTML = '<span class="checkmark">✓</span> Bridging Successful';
      
          // Reset button after 3 seconds
          setTimeout(() => {
            button.disabled = false;
            button.classList.remove('success');
            button.innerHTML = 'Bridge USDC';
          }, 3000);
      
          console.log(\`Bridged \${amount} USDC from \${fromNetwork} to \${toNetwork}\`);
        });
      `,
    },
  });
});

app.get("/faucet", (req, res) => {
  //return res.json({iframe: {html: "", js: ""}});
  res.json({
    iframe: {
      html: `
        <style>
          .faucet-card {
            background-color: white;
            border-radius: 15px;
            padding: 10px;
            width: 100%;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            align-self: center;
            max-width: 600px;
          }
          .faucet-card img {
            width: 100%;
            height: auto;
            max-height: 250px;
            object-fit: contain;
            border-radius: 12px;
            margin-bottom: 10px;
          }
          .faucet-content {
            background-color: #f7f9fa;
            border-radius: 12px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .faucet-input {
            display: flex;
            align-items: center;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 5px;
            flex: 1;
          }
          .faucet-input img {
            width: 24px;
            height: 24px;
            margin-right: 8px;
          }
          input {
            border: none;
            background-color: transparent;
            font-size: 14px;
            width: 100%;
            padding: 5px;
          }
          @keyframes gradient-animation {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
          button {
            background-color: #1da1f2;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          button:disabled {
            cursor: not-allowed;
          }
          button.loading {
            background-image: linear-gradient(
              90deg,
              #0099ff 0%,
              #ff66cc 50%,
              #0099ff 100%
            );
            background-size: 200% 100%;
            animation: gradient-animation 1s linear infinite;
          }
          button.success {
            background-color: #4CAF50;
          }
          .checkmark {
            color: white;
            font-size: 24px;
            margin-right: 8px;
          }
        </style>
        <div class="faucet-card">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1200px-Ethereum_logo_2014.svg.png"
            alt="Ethereum Logo"
          />
          <div class="faucet-content">
            <div class="faucet-input">
              <img
                src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
                alt="ETH"
              />
              <input id="addressInput" type="text" placeholder="Enter your ETH address" />
            </div>
            <button id="faucetButton">Get ETH</button>
          </div>
        </div>
      `,
      js: `
        console.log('ETH Faucet');
        document.getElementById('faucetButton').addEventListener('click', async () => {
          const button = document.getElementById('faucetButton');
          const address = document.getElementById('addressInput').value.trim();
      
          if (!address) {
            alert('Please enter your ETH address.');
            return;
          }
      
          // Disable the button and add loading class
          button.disabled = true;
          button.classList.add('loading');
          button.innerHTML = 'Sending ETH...';
      
          // Simulate a delay for the faucet process
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
      
          // Show success message
          button.classList.remove('loading');
          button.classList.add('success');
          button.innerHTML = '<span class="checkmark">✓</span> ETH Sent Successfully';
      
          // Reset button after 3 seconds
          setTimeout(() => {
            button.disabled = false;
            button.classList.remove('success');
            button.innerHTML = 'Get ETH';
          }, 3000);
      
          console.log(\`Sent ETH to \${address}\`);
        });
      `,
    },
  });
});

app.get("/donation", (req, res) => {
  //return res.json({iframe: {html: "", js: ""}});
  res.json({
    iframe: {
      html: `
        <style>
  .card {
    position: relative;
    background-color: white;
    border-radius: 15px;
    padding: 10px;
    width: 100%;
    max-width: 600px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: -20px;
  }
  .card img {
    width: 100%;
    max-width: 600px;
    height: auto;
    object-fit: cover;
    border-radius: 15px;
    margin-bottom: -5px;
  }
  .content {
    background-color: #f7f9fa;
    border-radius: 12px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 5px;
  }
  .input {
    display: flex;
    align-items: center;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 12px;
    padding: 8px;
    gap: 5px;
  }
  .input img {
    width: 24px;
    height: 24px;
  }
  input[type='number'] {
    border: none;
    background-color: transparent;
    font-size: 16px;
    flex: 1;
    padding: 8px;
  }
  button {
    background-color: #1da1f2;
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  button:hover {
    background-color: #0f8de8;
  }
  button:disabled,
  .predefined-button:disabled {
    cursor: not-allowed;
    background-color: #ccc;
  }
  button.loading,
  .predefined-button.loading {
    background-image: linear-gradient(90deg, #0099ff 0%, #ff66cc 50%, #0099ff 100%);
    background-size: 200% 100%;
    animation: gradient-animation 1s linear infinite;
  }
  button.success {
    background-color: #4caf50;
  }
  .checkmark {
    color: white;
    font-size: 24px;
    margin-right: 8px;
  }
  .predefined-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
  .predefined-button {
    flex: 1;
    margin: 0 5px;
  }

  @keyframes gradient-animation {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
</style>
<div class="card">
    <img src="https://t4.ftcdn.net/jpg/05/76/12/63/360_F_576126362_ll2tqdvXs27cDRRovBTmFCkPM9iX68iL.jpg" alt="Background Image" />
    <div class="content">
      <div class="input">
        <img src="https://etherscan.io/token/images/apecoin_32.png" alt="APE" />
        <input id="donationAmount" type="number" placeholder="Enter donation amount" />
      </div>
      <button id="donateButton">Donate APE</button>
      <div class="predefined-buttons">
        <button class="predefined-button" value="10"">Donate 10 APE</button>
        <button class="predefined-button" value="50">Donate 50 APE</button>
        <button class="predefined-button" value="100">Donate 100 APE</button>
      </div>
    </div>
  </div>
      `,
      js: `
    const predefinedButtons = document.querySelectorAll('.predefined-button')
    const donationAmountInput = document.getElementById('donationAmount')
    const mainButton = document.getElementById('donateButton')

    // Function to set predefined donation amounts and handle button states
    function setAmount(amount, clickedButton) {
      donationAmountInput.value = amount

      predefinedButtons.forEach((button) => {
        button.disabled = true
      })

      mainButton.classList.add('loading')
      mainButton.disabled = true
      mainButton.innerHTML = 'Donating...'
    }

    async function sendDonation(amount) {
      const recipient = '0x53FA684bDd93da5324BDc8B607F8E35eC79ccF5A'
      const tokenAddress = '0x4d224452801ACEd8B2F0aebE155379bb5D594381' // replace with token address
      const decimals = 18 // replace with token decimals
      if (typeof window.ethereum !== 'undefined') {
        try {
          console.log('Sending transaction')
          const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
          const publicKey = accounts[0]
          const amountToSend = (amount * Math.pow(10, decimals)).toString(16)

          console.log(amountToSend)

          const data = '0xa9059cbb' + recipient.substring(2).padStart(64, '0') + amountToSend.padStart(64, '0')
          const transactionParameters = {
            to: tokenAddress,
            from: publicKey,
            data: data,
          }

          console.log(transactionParameters)

          const txHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
          })

          const checkTransactionStatus = async (hash) => {
            const receipt = await ethereum.request({
              method: 'eth_getTransactionReceipt',
              params: [hash],
            })
            if (receipt && receipt.blockNumber) {
              predefinedButtons.forEach((button) => {
                button.disabled = false
                button.classList.remove('loading')
              })
              mainButton.classList.remove('loading')
              mainButton.classList.add('success')
              mainButton.innerHTML = '<span class="checkmark">✓</span> Donation Successful'
              setTimeout(() => {
                mainButton.classList.remove('success')
                mainButton.disabled = false
                mainButton.innerHTML = 'Donate USDC'
              }, 3000)
            } else {
              setTimeout(() => checkTransactionStatus(hash), 1000)
            }
          }

          checkTransactionStatus(txHash)
        } catch (error) {
          console.error(error)
        }
      } else {
        alert('MetaMask is not installed')
      }
    }

    document.getElementById('donateButton').addEventListener('click', async () => {
      const button = document.getElementById('donateButton')
      const amount = document.getElementById('donationAmount').value

      // Validate input
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid donation amount.')
        return
      }

      // Disable the button and add loading class
      button.disabled = true
      button.classList.add('loading')
      button.innerHTML = 'Donating...'

      // Simulate a delay for the donation process
      // Send the donation to the blockchain
      sendDonation(amount)
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate a 3 seconds delay

      // Show success message
      button.disabled = false
      button.classList.remove('loading')
      button.classList.add('success')
      button.innerHTML = '<span class="checkmark">✓</span> Donation Successful'

      // Reset button after 3 seconds
      setTimeout(() => {
        button.classList.remove('success')
        button.innerHTML = 'Donate USDC'
      }, 3000)

      console.log('Donated USDC')
    })
    predefinedButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setAmount(button.value, button)
        const amount = document.getElementById('donationAmount').value
        sendDonation(amount)
      })
    })
      `,
    },
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "test.html"));
});

app.listen(80);
