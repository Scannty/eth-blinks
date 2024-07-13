import React, { useState } from 'react'
import { HexColorPicker } from 'react-colorful'

const EditElement = () => {
  const [bgColor, setBgColor] = useState('#ffffff')
  const [textColor, setTextColor] = useState('#333333')
  const [text, setText] = useState('Your text here')
  const [hexInput, setHexInput] = useState('#ffffff')
  const [colorTarget, setColorTarget] = useState('background') // 'background' or 'text'

  const handleHexInputChange = (e) => {
    const newColor = e.target.value
    setHexInput(newColor)
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      if (colorTarget === 'background') {
        setBgColor(newColor)
      } else {
        setTextColor(newColor)
      }
    }
  }

  const handleColorChange = (newColor) => {
    setHexInput(newColor)
    if (colorTarget === 'background') {
      setBgColor(newColor)
    } else {
      setTextColor(newColor)
    }
  }

  const toggleColorTarget = () => {
    setColorTarget((prevTarget) => (prevTarget === 'background' ? 'text' : 'background'))
  }

  const generateHtmlCode = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Component</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f0f0f0;
    }
    .editBox {
      width: 300px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background-color: ${bgColor};
    }
    .text {
      font-family: Arial, sans-serif;
      font-size: 1.5em;
      color: ${textColor};
    }
  </style>
</head>
<body>
  <div class="editBox">
    <h2 class="text">${text}</h2>
    <h1 id="naslovce">Send ERC-20 Token</h1><p>Send tokens to the following address:</p>
    <input placeholder="Type the address..." value="0x679a9aa509A85EeA7912D76d85b0b9195972B211" type="text" id="inputAddress">
    <input placeholder="Type the token amount..." type="number" id="inputAmount">
    <button id="dugme">Send Token</button>
  </div>
</body>
</html>
    `
  }

  const generateJsCode = () => {
    return `console.log('ERC-20 Token Transfer');
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
document.getElementById('dugme').addEventListener('click', showAlert);`
  }

  // const downloadHtmlCode = () => {

  //   const element = document.createElement('a')
  //   const file = new Blob([generateHtmlCode()], { type: 'text/html' })
  //   element.href = URL.createObjectURL(file)
  //   element.download = 'CustomComponent.html'
  //   document.body.appendChild(element) // Required for this to work in FireFox
  //   element.click()
  // }

  const storeToIpfs = async () => {
    const html = generateHtmlCode()
    const js = generateJsCode()
    const iFrame = { html: html, js: js }
    console.log(JSON.stringify(iFrame))
    const response = await fetch('http://localhost:3000/storeToIpfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(iFrame),
    })
    console.log(response)
    const data = await response.text()
    console.log(data)
  }

  return (
    <div style={styles.container}>
      <div style={styles.editContainer}>
        <div style={{ ...styles.editBox, backgroundColor: bgColor }}>
          <h2 style={{ ...styles.text, color: textColor }}>{text}</h2>
        </div>
      </div>
      <div style={styles.controls}>
        <div style={styles.control}>
          <label style={styles.label}>Change {colorTarget === 'background' ? 'Background' : 'Text'} Color</label>
          <HexColorPicker
            color={colorTarget === 'background' ? bgColor : textColor}
            onChange={handleColorChange}
            style={styles.colorPicker}
          />
          <input type="text" value={hexInput} onChange={handleHexInputChange} style={styles.hexInput} placeholder="#000000" />
          <button onClick={toggleColorTarget} style={styles.toggleButton}>
            {colorTarget === 'background' ? 'Switch to Text Color' : 'Switch to Background Color'}
          </button>
        </div>

        <div style={styles.control}>
          <label style={styles.label}>Edit Text:</label>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} style={styles.input} />
        </div>
        <div style={styles.control}>
          <button onClick={storeToIpfs} style={styles.downloadButton}>
            Download HTML
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    width: '50vw',
    maxHeight: '85vh',
    borderRadius: '20px',
  },
  editContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '20px',
  },
  editBox: {
    width: '100%',
    height: '100%',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '1.5em',
  },
  controls: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  control: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  label: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '1em',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '1em',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '20px',
  },
  hexInput: {
    width: '100%',
    padding: '10px',
    fontSize: '1em',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginTop: '10px',
    textAlign: 'center',
  },
  colorPicker: {
    marginBottom: '20px',
  },
  toggleButton: {
    padding: '10px 20px',
    fontSize: '1em',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    marginTop: '10px',
    width: '100%',
  },
  downloadButton: {
    padding: '10px 20px',
    fontSize: '1em',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
  },
}

export default EditElement
