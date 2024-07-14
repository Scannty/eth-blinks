import '../styles/section1.css';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import '../../../../index.css'
import logo from '../../../../assets/img/shines (1).png'

const Section1 = ({ handleButtonClick }) => {
  const [email, setEmail] = useState('');

  const handleJoinWaitlist = () => {
    console.log('Join waitlist with email:', email);
  };

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '-100px 0px',
  });

  return (
    <div className="backAnimation section1div" style={{ height: '100%', width: '100%', display: 'flex', zoom: "0.8" }} >
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>

      <img src={logo} alt="Logo" style={styles.logo} className={`section1TitleDiv ${inView ? 'fadeIn' : ''}`} />
      <div style={{ color: 'black', marginTop: '10%' }} className={`section1TitleDiv ${inView ? 'fadeIn' : ''}`} ref={ref}>
        <h1 className='lexend-h1'>Bring Your Web3</h1>
        <h1 className='lexend-h1'>Projects To</h1>
        <h1 className='lexend-h1'>A Larger Audience </h1>
        <h1 className='lexend-h1'>With Ephi</h1>
      </div>
      <div className={`waitlist-section ${inView ? 'fadeIn' : ''}`} style={styles.waitlistSection}>
        <p className='description' style={styles.description}>
          Make affiliate links, promote swaps, mint NFT's and much more. Deploy on X, Reddit, Facebook, etc. Community driven and open sourced.
        </p>
        <button
          variant="light"
          className="launch-app-button2"
          style={styles.primaryButton}
          onClick={handleButtonClick}
        >
          Create Your First Eth Blink
        </button>

        <button
          variant="light"
          className="launch-app-button2"
          style={styles.secondaryButton}
          onClick={handleButtonClick}
        >
          Check Out The Repo
        </button>
      </div>
    </div>
  );
}

const styles = {
  waitlistSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)', // Blurring the background for a softer look
    maxWidth: '600px',
    margin: 'auto',
    marginRight: '100px'
  },
  description: {
    fontSize: '1.1em',
    color: 'black',
    textAlign: 'left', // Align the description text to the left
    marginBottom: '20px',
  },
  primaryButton: {
    fontSize: '0.9em',
    width: '100%',
    marginTop: '20px',
    color: 'black',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid black',
    color: '#f15d50da'

  },
  secondaryButton: {
    fontSize: '0.8em',
    width: '100%',
    marginTop: '20px',
    color: 'white',
    backgroundColor: 'black',
    borderRadius: '12px',
    border: '1px solid black',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    width: '80px', // Adjust the size as needed
    height: 'auto',
    zIndex: 1000,
  },
};

styles.primaryButton[':hover'] = {
  backgroundColor: '#0f8de8',
};

styles.secondaryButton[':hover'] = {
  backgroundColor: '#f0f0f0',
};

export default Section1;
