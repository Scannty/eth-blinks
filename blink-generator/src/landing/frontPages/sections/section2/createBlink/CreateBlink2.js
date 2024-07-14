import React, { useState, useEffect } from 'react';
import EditElement from '../../../../components/EditElement';
import templates from '../../../../../assets/blinkTemplates.json';
import Loader1 from '../../../../components/Loader1';
import { saveAs } from 'file-saver';

function CreateBlink2({ currentBlinkObject, setCurrentBlinkObject, handleNextClick }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingElement, setEditingElement] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#333333');
  const [text, setText] = useState('Your text here');
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [referrer, setReferrer] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationDecimals, setDestinationDecimals] = useState('');
  const [recipient, setRecipient] = useState("0x000000000000000000000000000000000");

  useEffect(() => {
    if (currentBlinkObject.templateName) {
      setSelectedTemplate(currentBlinkObject.templateName);
    }
  }, [currentBlinkObject]);

  const handleTemplateSelect = (templateName) => {
    setSelectedTemplate(templateName);
    setEditingElement(null); // Reset editing element when a new template is selected
  };

  const handleElementClick = (element) => {
    setEditingElement(element);
    setBgColor(element.style.backgroundColor || '#ffffff');
    setTextColor(element.style.color || '#333333');
    setText(element.textContent || 'Your text here');

    if (element.tagName === 'IMG') {
      setShowTooltip(true);
      setImageUrl(element.src);
    } else {
      setShowTooltip(false);
    }
  };

  const handleBgColorChange = (newColor) => {
    setBgColor(newColor);
    if (editingElement) {
      editingElement.style.backgroundColor = newColor;
    }
  };

  const handleTextColorChange = (newColor) => {
    setTextColor(newColor);
    if (editingElement) {
      editingElement.style.color = newColor;
    }
  };

  const handleTextChange = (newText) => {
    setText(newText);
    if (editingElement) {
      editingElement.textContent = newText;
    }
  };

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  const updateImageUrl = () => {
    if (editingElement) {
      editingElement.src = imageUrl;
    }
    setShowTooltip(false);
  };

  const cancelImageUpdate = () => {
    setShowTooltip(false);
  };

  const createBlink = async () => {
    const editedHtml = document.querySelector('.templateContainer').innerHTML;
    const htmlContent = `
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
    .templateContainer {
      width: 300px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="templateContainer">
    ${editedHtml}
  </div>
</body>
</html>
    `;

    const modifiedJs = templates[selectedTemplate].js
      .replace('var referrer;', `var referrer = '${referrer}';`)
      .replace(
        /destinationToken = \{(.|\n)*?\};/,
        `destinationToken = { // HARDCODE BY GENERATOR
          name: "USDC",
          address: "${destinationAddress}",
          decimals: ${destinationDecimals},
          image: "https://cdn3d.iconscout.com/3d/premium/thumb/usdc-10229270-8263869.png?f=webp"
        };`
      );

    const iFrame = { iframe: { html: htmlContent, js: modifiedJs } };
    const res = await fetch('http://localhost:8000/storeToIpfs', {
      method: 'POST',
      body: JSON.stringify(iFrame),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(res);
    console.log(await res.text());
  };

  const handleDeployClick = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate 5 seconds delay
    setIsLoading(false);
    createBlink();
  };

  const handleDownloadClick = () => {
    const editedHtml = document.querySelector('.templateContainer').innerHTML;
    const htmlContent = `
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
    .templateContainer {
      width: 300px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="templateContainer">
    ${editedHtml}
  </div>
</body>
</html>
    `;

    const modifiedJs = templates[selectedTemplate].js
      .replace('var referrer;', `var referrer = '${referrer}';`)
      .replace(
        /destinationToken = \{(.|\n)*?\};/,
        `destinationToken = { // HARDCODE BY GENERATOR
          name: "USDC",
          address: "${destinationAddress}",
          decimals: ${destinationDecimals},
          image: "https://cdn3d.iconscout.com/3d/premium/thumb/usdc-10229270-8263869.png?f=webp"
        };`
      );

    const iFrame = { iframe: { html: htmlContent, js: modifiedJs } };
    const blob = new Blob([JSON.stringify(iFrame, null, 2)], { type: 'application/json' });
    saveAs(blob, 'blinkTemplate.json');
  };

  return (
    <div style={{ padding: '10px', zoom: '0.67' }}>
      <h4>Edit Your Blink</h4>
      <a style={{ fontSize: '1.1em' }}>Click On Element You Want To Edit And Change Its Color, Text or Image</a>
      {isLoading ? (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '50%', flexDirection: 'column-reverse' }}>
          <Loader1 />
          Deploying Your Ethereum Blink To IPFS
        </div>
      ) : (
        <>
          {selectedTemplate && (
            <div style={styles.editorContainer}>
              <div
                className="templateContainer"
                style={{ ...styles.templateContainer, marginTop: '0px' }}
                dangerouslySetInnerHTML={{ __html: templates[selectedTemplate].html }}
                onClick={(e) => handleElementClick(e.target)}
              />
              {editMode && (
                <EditElement
                  bgColor={bgColor}
                  textColor={textColor}
                  text={text}
                  onBgColorChange={handleBgColorChange}
                  onTextColorChange={handleTextColorChange}
                  onTextChange={handleTextChange}
                  createBlink={createBlink}
                />
              )}
              {showTooltip && (
                <div style={styles.tooltip}>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="Enter image URL"
                    style={styles.input}
                  />
                  <div style={styles.buttonContainer}>
                    <button onClick={updateImageUrl} style={styles.button}>
                      Post
                    </button>
                    <button onClick={cancelImageUpdate} style={styles.cancelButton}>
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            {!editMode && (
              <>
                <button className="launch-app-button" onClick={() => setEditMode(true)} style={styles.editButton}>
                  Edit
                </button>
                <button className="launch-app-button" style={styles.nextButton} onClick={handleDeployClick}>
                  Deploy
                </button>
               
              </>
            )}
            {editMode && (
              <>
                <button className="launch-app-button" onClick={() => setEditMode(false)} style={styles.saveButton}>
                  Save
                </button>
                <button className="launch-app-button" onClick={() => setEditMode(false)} style={{ width: '50%', backgroundColor: '#e5e5e5', color: 'black' }}>
                  Cancel
                </button>
              </>
            )}
          </div>
          {selectedTemplate === 'swap' && (
  <div style={{
    marginTop: '20px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }}>
    <h5 style={{
      fontSize: '1.2em',
      fontWeight: 'bold',
      marginBottom: '10px',
    }}>Edit Swap Fields</h5>
    <label style={{
      fontSize: '1em',
      marginBottom: '5px',
      marginRight:'25px'
    }}>Referrer</label>
    <input
      type="text"
      value={referrer}
      onChange={(e) => setReferrer(e.target.value)}
      style={{
        padding: '5px',
        marginBottom: '10px',
        borderRadius: '3px',
        border: '1px solid #ccc',
        width: '200px',
        marginRight:'25px'

      }}
    />
    <label style={{
      fontSize: '1em',
      marginBottom: '5px',
      marginRight:'25px'

    }}>Destination Address</label>
    <input
      type="text"
      value={destinationAddress}
      onChange={(e) => setDestinationAddress(e.target.value)}
      style={{
        padding: '5px',
        marginBottom: '10px',
        borderRadius: '3px',
        border: '1px solid #ccc',
        width: '200px',
        marginRight:'25px'

      }}
    />
    <label style={{
      fontSize: '1em',
      marginBottom: '5px',
      marginRight:'25px'

    }}>Destination Decimals</label>
    <input
      type="number"
      value={destinationDecimals}
      onChange={(e) => setDestinationDecimals(e.target.value)}
      style={{
        padding: '5px',
        marginBottom: '10px',
        borderRadius: '3px',
        border: '1px solid #ccc',
        width: '200px',
      }}
    />
  </div>
)}

{selectedTemplate === 'donation' && (
  <div style={{
    marginTop: '20px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    width: '100%',
    maxWidth: '600px',
    margin: 'auto',
  }}>
    <h5 style={{
      fontSize: '1.2em',
      fontWeight: 'bold',
      marginBottom: '10px',
      textAlign: 'center',
    }}>Edit Donation Fields</h5>
    <label style={{
      fontSize: '1em',
      marginBottom: '5px',
    }}>Recipient</label>
    <input
      type="text"
      value={recipient}
      onChange={(e) => setRecipient(e.target.value)}
      style={{
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        width: '100%',
      }}
    />
  </div>
)}


        </>
      )}
      
    </div>
  );
}

const styles = {
  editorContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '10px',
    marginTop: '50px',
    marginBottom: '20px',
    backdropFilter: 'blur(10px)',
  },
  templateContainer: {
    flex: 2,
    borderRadius: '10px',
    padding: '20px',
    marginRight: '20px',
  },
  editButton: {
    color: 'white',
    fontSize: '1.2em',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: 'skyblue',
    width: '50%',
    transition: 'background-color 0.3s ease',
  },
  nextButton: {
    color: 'white',
    fontSize: '1.2em',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '',
    width: '50%',
    transition: 'background-color 0.3s ease',
  },
  downloadButton: {
    color: 'white',
    fontSize: '1.2em',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: 'green',
    width: '50%',
    transition: 'background-color 0.3s ease',
  },
  saveButton: {
    color: 'white',
    fontSize: '1.2em',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#4b8cd0',
    width: '50%',
    transition: 'background-color 0.3s ease',
  },
  cancelButton: {
    color: 'white',
    fontSize: '1.2em',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: 'black',
    width: '50%',
    transition: 'background-color 0.3s ease',
  },
  tooltip: {
    position: 'absolute',
    top: '50%',
    left: '23%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    padding: '5px',
    marginBottom: '10px',
    borderRadius: '3px',
    border: '1px solid #ccc',
    width: '200px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: '5px 10px',
    borderRadius: '3px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
    marginRight: '5px',
  },
  cancelButton: {
    padding: '5px 10px',
    borderRadius: '3px',
    border: 'none',
    backgroundColor: '#FF0000',
    color: 'white',
    cursor: 'pointer',
  },
  fieldsContainer: {
    marginTop: '20px',
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: '#f0f0f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};

export default CreateBlink2;
