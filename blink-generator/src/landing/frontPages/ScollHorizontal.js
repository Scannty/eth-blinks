import React, { useState, useEffect } from 'react';
import CreateBlink1 from './sections/section2/createBlink/CreateBlink1';
import CreateBlink2 from './sections/section2/createBlink/CreateBlink2';
import CreateBlink3 from './sections/section2/createBlink/CreateBlink3';

// Navigation Dots Component
const NavigationDots = ({ sections, currentSection }) => (
  <div style={{
    position: 'fixed',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    display: 'flex',
  }}>
    {sections.map((_, index) => (
      <div
        key={index}
        style={{
          width: currentSection === index ? '8px' : '8px',
          height: currentSection === index ? '8px' : '8px',
          borderRadius: '50%',
          backgroundColor: currentSection === index ? 'black' : 'black',
          margin: '0 7px',
          transition: 'all 0.3s ease-out',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          opacity: currentSection === index ? 1 : 0.7,
        }}
      />
    ))}
  </div>
);

const ScrollHorizontal = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentBlinkObject, setCurrentBlinkObject] = useState({});

  const handleScroll = (e) => {
    e.preventDefault();
    if (isScrolling) return;

    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 1000);

    if (e.deltaY > 0) {
      setCurrentSection(prevSection => Math.min(prevSection + 1, sections.length - 1));
    } else if (e.deltaY < 0) {
      setCurrentSection(prevSection => Math.max(prevSection - 1, 0));
    }
  };

  const handleNextClick = () => {
    setCurrentSection(prevSection => Math.min(prevSection + 1, sections.length - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isScrolling) return;

      if (e.key === 'ArrowRight') {
        setCurrentSection(prevSection => Math.min(prevSection + 1, sections.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSection(prevSection => Math.max(prevSection - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScrolling]);

  const sections = [
    <CreateBlink1 currentBlinkObject={currentBlinkObject} setCurrentBlinkObject={setCurrentBlinkObject} handleNextClick={handleNextClick} />,
    <CreateBlink2 currentBlinkObject={currentBlinkObject} setCurrentBlinkObject={setCurrentBlinkObject} handleNextClick={handleNextClick} />,
    <CreateBlink3 currentBlinkObject={currentBlinkObject} setCurrentBlinkObject={setCurrentBlinkObject} handleNextClick={handleNextClick} />
  ];

  return (
    <div onWheel={handleScroll} style={{ width: '100vw', overflow: 'hidden', position: 'relative',  }}>
      <div style={{ display: 'flex', width: `${sections.length * 100}vw`, transition: 'transform 0.75s ease-out', transform: `translateX(-${currentSection * 100}vw)` }}>
        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              ...getSectionStyle(""),
            }}
          >
            {React.cloneElement(section, { currentBlinkObject, setCurrentBlinkObject, handleScroll })}
          </div>
        ))}
      </div>
      <NavigationDots sections={sections} currentSection={currentSection} />
    </div>
  );
};

// Dynamic background color style
const getSectionStyle = (backgroundColor) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  backgroundColor,
});

export default ScrollHorizontal;
