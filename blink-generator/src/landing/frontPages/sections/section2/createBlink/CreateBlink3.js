import React, { useState } from 'react';
import templates from '../../../../../assets/blinkTemplates.json';

function CreateBlink3({ currentBlinkObject, setCurrentBlinkObject, handleNextClick }) {
  const [currentBlinkObjectState, setCurrentBlinkObjectState] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  function updateBlinkObjectTemplate(id, name) {
    const newBlinkObject = { ...currentBlinkObject, templateId: id, templateName: name };
    setCurrentBlinkObject(newBlinkObject);
    setCurrentBlinkObjectState(true);
    setSelectedTemplate(name);
  }

  return (
    <div style={{height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" , zoom:"0.8"}} >
            <h4>Choose A Template For Your Blink</h4>

      <div style={{ display: "flex", flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', width: "90vw", marginTop: '40px' }}>
        {Object.keys(templates).map((template, index) => (
          <div
            key={index}
            style={{
              backgroundColor: selectedTemplate === template ? "#f5f5f5" : "white",
              padding: '50px',
              margin: 10,
              borderRadius: 30,
              border: selectedTemplate === template ? "3px solid orange" : "3px solid transparent",
              transition: "all 0.3s ease-in-out",
              cursor: "pointer",
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onClick={() => updateBlinkObjectTemplate(index + 1, template)}
          >
            <div dangerouslySetInnerHTML={{ __html: templates[template].html }} />
          </div>
        ))}
      </div>
      <button
        className="launch-app-button"
        style={{ color: 'white', marginTop: 10, fontSize: "1.2em", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", backgroundColor: currentBlinkObjectState ? "black" : "orange" }}
        onClick={handleNextClick}
        disabled={!currentBlinkObjectState}
      >
        {currentBlinkObjectState ? "Next" : "Choose a template"}
      </button>
    </div>
  );
}

export default CreateBlink3;
