import ScrollHorizontal from '../../ScollHorizontal';
import '../styles/section2.css'
import { useInView } from 'react-intersection-observer';


function Section2(){
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1, // Trigger when 10% of the element is in view
      });
    return(
        <div className="section2-parentContainer" style={{ backgroundColor: "#ffa433", height: '100%', width: '100%', display: 'flex', justifyContent: 'center',}}>
        <div className={`section2-container ${inView ? 'fadeIn' : ''}`} ref={ref}>
        
          <ScrollHorizontal/>
        </div>
      </div>
    )
}

export default Section2