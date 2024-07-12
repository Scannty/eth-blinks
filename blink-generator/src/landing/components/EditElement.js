import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

const EditElement = () => {
  const [color, setColor] = useState('#ffffff');
  const [text, setText] = useState('Your text here');
  const [hexInput, setHexInput] = useState('#ffffff');

  const handleHexInputChange = (e) => {
    const newColor = e.target.value;
    setHexInput(newColor);
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      setColor(newColor);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.editContainer}>
        <div style={{ ...styles.editBox, backgroundColor: color }}>
          <h2 style={styles.text}>{text}</h2>
        </div>
      </div>
      <div style={styles.controls}>
        <div style={styles.control}>
          <label style={styles.label}>Change Color:</label>
          <HexColorPicker color={color} onChange={setColor} />
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            style={styles.hexInput}
            placeholder="#000000"
          />
        </div>
        <div style={styles.control}>
          <label style={styles.label}>Edit Text:</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f0f0f0',
    padding: '20px',
  },
  editContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '20px',
  },
  editBox: {
    width: '300px',
    height: '200px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '1.5em',
    color: '#333',
  },
  controls: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  control: {
    width: '100%',
    maxWidth: '300px',
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
};

export default EditElement;
