import '../styles/section1.css' // Ensure to create an accompanying CSS file to style your components
import { useInView } from 'react-intersection-observer';
import '../styles/section1.css'
import { useState } from 'react';
const Section1 = () => {
  const [email, setEmail] = useState(''); // State to hold the email input

  const handleJoinWaitlist = () => {
    // Placeholder function for joining the waitlist
    console.log('Join waitlist with email:', email);
    // Implement waitlist logic here
  };

  const logoUrl = 'https://i.ibb.co/nbWGqSv/30-01-6-900x600-removebg-preview.png'; // Replace with your actual image URL for the logo
  const generateRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '-100px 0px', // Trigger as soon as the element comes into view
  });
  // Pre-generate random colors for each section
  const sectionColors = Array.from({ length: 3 }, generateRandomColor);
  return (
    <div style={{ backgroundColor:"white", height:'100%', width:'100%', display:'flex'}} className='section1div'> 
<br/>   
<br/>   
<br/>   
<div style={{color:'black', marginTop:'5%'}} className={`section1TitleDiv ${inView ? 'fadeIn' : ''}`} ref={ref}>
    <h1 className='lexend-h1'>Biring Your Web3</h1>
   <h1 className='lexend-h1'>Projects To </h1>
   <h1 className='lexend-h1'> A Larger Audience</h1>
   <div style={{width:'80%', height:'5px', backgroundColor:'black'}}></div>
   <br/>
   <h1 className='lexend-h1'>Welcome To Miata</h1>

   
   </div>
   <div className={`waitlist-section ${inView ? 'fadeIn' : ''}`}  >
   
<button variant="light" className="launch-app-button" style={{fontSize:"1.2em"}}>Create Your First Etherium Blink</button>

      </div>
  </div>
  );
}

export default Section1;
