import React, { useState, useEffect } from 'react';
import EditElement from '../../../../components/EditElement';
import templates from '../../../../../assets/blinkTemplates.json';

function CreateBlink2({ currentBlinkObject, setCurrentBlinkObject, handleNextClick }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingElement, setEditingElement] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#333333');
  const [text, setText] = useState('Your text here');
  const [editMode, setEditMode] = useState(false);

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
    const iFrame = { iframe: { html: htmlContent, js: templates[selectedTemplate].js } };
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

  return (
    <div style={{height: '100vh', padding: '10px', zoom: '0.8' }}>
{selectedTemplate && (
        <div style={styles.editorContainer}>
          <div
            className="templateContainer"
            style={{ ...styles.templateContainer, marginTop: '0px' }}
            dangerouslySetInnerHTML={{ __html: templates[selectedTemplate].html }}
            onClick={(e) => handleElementClick(e.target)}
          />
          {editMode && editingElement && (
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
        </div>
      )}
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        {!editMode && (
          <>
            <button
              className="launch-app-button"
              onClick={() => setEditMode(true)}
              style={styles.editButton}
            >
              Edit
            </button>
            <button
              className="launch-app-button"
              style={styles.nextButton}
              onClick={handleNextClick}
            >
              Next
            </button>
          </>
        )}
        {editMode && (
          <>
            <button
              className="launch-app-button"
              onClick={() => setEditMode(false)}
              style={styles.saveButton}
            >
              Save
            </button>
            <button
              className="launch-app-button"
              onClick={() => setEditMode(false)}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </>
        )}
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
};

export default CreateBlink2;
