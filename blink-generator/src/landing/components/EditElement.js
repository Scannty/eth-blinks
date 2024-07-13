import React, { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'

const EditElement = ({
  bgColor: initialBgColor,
  textColor: initialTextColor,
  text: initialText,
  onBgColorChange,
  onTextColorChange,
  onTextChange,
  createBlink,
}) => {
  const [bgColor, setBgColor] = useState(initialBgColor)
  const [textColor, setTextColor] = useState(initialTextColor)
  const [text, setText] = useState(initialText)
  const [hexInput, setHexInput] = useState(initialBgColor)
  const [colorTarget, setColorTarget] = useState('background') // 'background' or 'text'

  useEffect(() => {
    setBgColor(initialBgColor)
    setTextColor(initialTextColor)
    setText(initialText)
  }, [initialBgColor, initialTextColor, initialText])

  const handleHexInputChange = (e) => {
    const newColor = e.target.value
    setHexInput(newColor)
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      if (colorTarget === 'background') {
        setBgColor(newColor)
        onBgColorChange(newColor)
      } else {
        setTextColor(newColor)
        onTextColorChange(newColor)
      }
    }
  }

  const handleColorChange = (newColor) => {
    setHexInput(newColor)
    if (colorTarget === 'background') {
      setBgColor(newColor)
      onBgColorChange(newColor)
    } else {
      setTextColor(newColor)
      onTextColorChange(newColor)
    }
  }

  const toggleColorTarget = () => {
    setColorTarget((prevTarget) => (prevTarget === 'background' ? 'text' : 'background'))
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
    onTextChange(e.target.value)
  }

  return (
    <div style={styles.container}>

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
          <input type="text" value={text} onChange={handleTextChange} style={styles.input} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: '20px',
    width: '40vw',
    maxHeight: '80vh',
    borderRadius: '20px',
  },
  editContainer: {
    flex: 2,
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
    width: '100%',
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
    color:'black'
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
