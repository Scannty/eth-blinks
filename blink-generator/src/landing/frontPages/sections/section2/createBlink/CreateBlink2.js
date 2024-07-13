import React, { useState, useEffect } from 'react';
import EditElement from '../../../../components/EditElement';
import templates from '../../../../../assets/blinkTemplates.json';

function CreateBlink2({ currentBlinkObject, setCurrentBlinkObject }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingElement, setEditingElement] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#333333');
  const [text, setText] = useState('Your text here');
  const [editDone, setEditDone] = useState(true);

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
    if(editingElement)
    {
        setEditingElement(null)
    }
    setEditDone(!editDone)
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

  const downloadComponent = () => {
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

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = 'CustomComponent.html';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div style={{ backgroundColor: "#ffa433", height: '100vh', padding: '20px', zoom:"0.8" }}>
      {selectedTemplate && (
        <div style={styles.editorContainer}>
          <div
            className="templateContainer"
            style={{ ...styles.templateContainer, marginTop: '40px' }}
            dangerouslySetInnerHTML={{ __html: templates[selectedTemplate].html }}
            onClick={(e) => handleElementClick(e.target)}
          />
          {editingElement && (
            <EditElement
              bgColor={bgColor}
              textColor={textColor}
              text={text}
              onBgColorChange={handleBgColorChange}
              onTextColorChange={handleTextColorChange}
              onTextChange={handleTextChange}
              onDownload={downloadComponent}
            />
          )}
        </div>
      )}
              <button  className="launch-app-button"  
              onClick={(e) => handleElementClick(e.target)}
              style={{ color: 'white', marginTop: 10, fontSize: "1.2em", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", backgroundColor: "black" }}>{!editDone?"Save":"Edit this template"}</button>

    </div>
  );
}

const styles = {
  editorContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '10px',
    marginTop: '50px',
    marginBottom: '20px'
  },
  templateContainer: {
    flex: 2,
    borderRadius: '10px',
    padding: '20px',
    marginRight: '20px',
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
};

export default CreateBlink2;
