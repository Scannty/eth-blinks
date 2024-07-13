import ScrollHorizontal from '../../ScollHorizontal';
import '../styles/section2.css'
import { useInView } from 'react-intersection-observer';


function Section2(){
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1, // Trigger when 10% of the element is in view
      });
    return(
        <div className="section2-parentContainer" style={{ background: "linear-gradient(135deg, rgba(135, 206, 235, 0.2), rgba(255, 255, 255, 0.8))", height: '100%', width: '100%', display: 'flex', justifyContent: 'center',}}>
        <div className={`section2-container ${inView ? 'fadeIn' : ''}`} ref={ref}>
        
          <ScrollHorizontal/>
        </div>
      </div>
    )
}

export default Section2