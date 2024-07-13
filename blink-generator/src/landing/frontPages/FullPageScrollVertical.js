import React, { useState, useEffect } from 'react';
import Section1 from './sections/section1/Section1';
import Navbar from '../components/NavbarCustom';
import Section2 from './sections/section2/Section2';

const generateRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
const sectionColors = Array.from({ length: 2 }, generateRandomColor);
const sections = [<Section1 />, <Section2 />];

const NavigationDots = ({ sections, currentSection }) => (
  <div style={{
    position: 'fixed',
    left: '5px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1000,
  }}>
    {sections.map((_, index) => (
      <div
        key={index}
        style={{
          width: currentSection === index ? '12px' : '8px',
          height: currentSection === index ? '12px' : '8px',
          borderRadius: '50%',
          backgroundColor: currentSection === index ? 'orange' : 'black',
          margin: '7px 0',
          transition: 'all 0.3s ease-out',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          opacity: currentSection === index ? 1 : 0.7,
        }}
      />
    ))}
  </div>
);

const FullPageScrollVertical = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = (e) => {
    if (isScrolling) return;

    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 1000);

    if (e.deltaY > 0) {
      setCurrentSection(prevSection => Math.min(prevSection + 1, sectionColors.length - 1));
    } else if (e.deltaY < 0) {
      setCurrentSection(prevSection => Math.max(prevSection - 1, 0));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isScrolling) return;

      if (e.key === 'ArrowDown') {
        setCurrentSection(prevSection => Math.min(prevSection + 1, sectionColors.length - 1));
      } else if (e.key === 'ArrowUp') {
        setCurrentSection(prevSection => Math.max(prevSection - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScrolling]);

  const handleButtonClick = () => {
    setCurrentSection(prevSection => Math.min(prevSection + 1, sectionColors.length - 1));
  };

  return (
    <div onWheel={handleScroll} style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Navbar />
      <NavigationDots sections={sectionColors} currentSection={currentSection} />
      {sectionColors.map((color, index) => (
        <div
          key={index}
          style={{
            ...getSectionStyle(color),
            transform: `translateY(-${currentSection * 100}vh)`,
            transition: 'transform 0.75s ease-out',
          }}
        >
          {React.cloneElement(sections[index], { handleButtonClick })}
        </div>
      ))}
    </div>
  );
};

const getSectionStyle = (backgroundColor) => ({
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  width: '100%',
  backgroundColor,
});

export default FullPageScrollVertical;
