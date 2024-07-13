import '../styles/section1.css';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

import logo from '../../../../assets/img/shines.png'

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
    <div style={{ height: '100%', width: '100%', display: 'flex', zoom: "0.8", background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.2), rgba(255, 255, 255, 0.8))' }} className='section1div'>
      <img src={logo} alt="Logo" style={styles.logo}  className={`section1TitleDiv ${inView ? 'fadeIn' : ''}`}/>
      <div style={{ color: 'black', marginTop: '10%' }} className={`section1TitleDiv ${inView ? 'fadeIn' : ''}`} ref={ref}>
        <h1 className='lexend-h1'>Bring Your Web3</h1>
        <h1 className='lexend-h1'>Projects To</h1>
        <h1 className='lexend-h1'>A Larger Audience </h1>
        <h1 className='lexend-h1'>With Ephy</h1>
      </div>
      <div className={`waitlist-section ${inView ? 'fadeIn' : ''}`}>
  <p className='description'>
    Make affiliate links, promote swaps, mint NFT's and much more. Deploy on X, Reddit, Facebook, etc.  Community driven and open sourced.
  </p>
  <button
    variant="light"
    className="launch-app-button"
    style={{ fontSize: "0.9em", width:'100%', marginTop:'20px' }}
    onClick={handleButtonClick}
  >
    Create Your First Eth Blink
  </button>

  <button
    variant="light"
    className="launch-app-button"
    style={{ fontSize: "0.8em", width:'100%', marginTop:'20px', color:'black', backgroundColor:'white', }}
    onClick={handleButtonClick}
  >
    Check Out The Repo
  </button>
</div>

    </div>
  );
}

const styles = {
  logo: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    width: '80px', // Adjust the size as needed
    height: 'auto',
    zIndex: 1000,
  },
};

export default Section1;
