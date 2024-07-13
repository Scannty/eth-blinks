import React, { useState, useEffect } from 'react';
import templates from '../../../../../assets/blinkTemplates.json';

function CreateBlink3({ currentBlinkObject, setCurrentBlinkObject, handleNextClick }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (currentBlinkObject.templateName) {
      setSelectedTemplate(currentBlinkObject.templateName);
    }
  }, [currentBlinkObject]);

  const copyLink = async () => {
    try {
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
      const iFrame = { iframe: { html: htmlContent, js: templates[selectedTemplate].js } };
      const res = await fetch('http://localhost:8000/storeToIpfs', {
        method: 'POST',
        body: JSON.stringify(iFrame),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      const url = `http://localhost:8000/ipfs/${data.ipfsHash}`;
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  return (
    <div style={{ height: '100vh', padding: '5px', zoom: '0.7' }}>
        <h4>Your Blink Is Ready</h4>
        <a style={{fontSize:'1.1em'}}>It has been deployed and can be accessed via IPFS using the link below</a>

      {selectedTemplate && (
        <div style={styles.editorContainer}>
          <div
            className="templateContainer"
            style={{ ...styles.templateContainer, marginTop: '0px' }}
            dangerouslySetInnerHTML={{ __html: templates[selectedTemplate].html }}
          />
        </div>
      )}
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button
          className="launch-app-button"
          onClick={copyLink}
          style={styles.copyButton}
        >
          {linkCopied ? 'Link Copied!' : 'Copy Link'}
        </button>
        <button
          className="launch-app-button"
          style={styles.doneButton}
          onClick={handleNextClick}
        >
          Done
        </button>
      </div>
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
  copyButton: {
    color: 'white',
    fontSize: '1.2em',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: 'skyblue',
    width: '50%',
    transition: 'background-color 0.3s ease',
  },
  doneButton: {
    color: 'white',
    fontSize: '1.2em',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#4b8cd0',
    width: '50%',
    transition: 'background-color 0.3s ease',
  },
};

export default CreateBlink3;
