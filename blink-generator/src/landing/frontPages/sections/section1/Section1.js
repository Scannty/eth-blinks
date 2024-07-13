import '../styles/section1.css';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

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
    <div style={{ backgroundColor: "white", height: '100%', width: '100%', display: 'flex', zoom:"0.8" }} className='section1div'>
      <br />
      <br />
      <br />
      <div style={{ color: 'black', marginTop: '5%' }} className={`section1TitleDiv ${inView ? 'fadeIn' : ''}`} ref={ref}>
        <h1 className='lexend-h1'>Bring Your Web3</h1>
        <h1 className='lexend-h1'>Projects To</h1>
        <h1 className='lexend-h1'>A Larger Audience</h1>
        <div style={{ width: '80%', height: '5px', backgroundColor: 'black' }}></div>
        <br />
        <h1 className='lexend-h1'>Welcome To Miata</h1>
      </div>
      <div className={`waitlist-section ${inView ? 'fadeIn' : ''}`}>
        <button
          variant="light"
          className="launch-app-button"
          style={{ fontSize: "1.2em" }}
          onClick={handleButtonClick}
        >
          Create Your First Ethereum Blink
        </button>
      </div>
    </div>
  );
}

export default Section1;
