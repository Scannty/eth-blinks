import React, { useState, useEffect } from 'react';
import templates from '../../../../../assets/blinkTemplates.json';

function CreateBlink3({ currentBlinkObject, setCurrentBlinkObject, handleNextClick, newIPFShash }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [socialLinkCopied, setSocialLinkCopied] = useState(false);

  useEffect(() => {
    if (currentBlinkObject.templateName) {
      setSelectedTemplate(currentBlinkObject.templateName);
    }
  }, [currentBlinkObject]);

  const copyLink = async () => {
    try {
      const url = 'ipfs://'+newIPFShash; // The IPFS link you want to copy
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const copySocialLink = async () => {
    try {
      const url = '<blk ipfs://'+newIPFShash+' blk>'
      await navigator.clipboard.writeText(url);
      setSocialLinkCopied(true);
      setTimeout(() => setSocialLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying social link:', error);
    }
  };

  return (
    <div style={{  padding: '5px', zoom: '0.68' }}>
      <h4>Your Blink Is Ready</h4>
      <a style={{ fontSize: '1.1em' }}>It has been deployed and can be accessed via IPFS using the link below</a>
      <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
        <button
          className="launch-app-button"
          onClick={copyLink}
          style={styles.copyButton}
        >
          {linkCopied ? 'IPFS Link Copied To Clipboard' : 'Copy Link'}
        </button>
        <button
          className="launch-app-button"
          style={styles.doneButton}
          onClick={copySocialLink}
        >
          {socialLinkCopied ? 'Social Link Copied To Clipboard' : 'Post To Socials'}
        </button>
      </div>
      {selectedTemplate && (
        <div style={styles.editorContainer}>
          <div
            className="templateContainer"
            style={{ ...styles.templateContainer, marginTop: '0px' }}
            dangerouslySetInnerHTML={{ __html: templates[selectedTemplate].html }}
          />
        </div>
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

