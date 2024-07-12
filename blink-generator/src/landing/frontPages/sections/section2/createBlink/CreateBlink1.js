import templateImg from '../../../../../assets/img/templatePlaceholder.png';
import { useState } from 'react';

function CreateBlink1({currentBlinkObject, setCurrentBlinkObject, handleScroll}){
    const [currentBlinkObjectState, setCurrentBlinkObjectState] = useState(false)
    function updateBlinkObjectTemplate(id){

        const newBlinkObject = currentBlinkObject
        newBlinkObject['templateId'] = id
        setCurrentBlinkObject(newBlinkObject)
        setCurrentBlinkObjectState(true)
    
    }
    return(
        <div style={{backgroundColor:"#ffa433" }}>
            <h2 className=' .lexend-h2'>Choose a template to start</h2>
            <div style={{display:"flex", flexDirection:"row", justifyContent:'space-between', alignItems: 'center', width:"90vw", marginTop:'40px'}}>
                <div style={{backgroundColor:"white", padding:'30px', margin:10, borderRadius:30}} onClick={()=>updateBlinkObjectTemplate(1)}>
                    <img src = {templateImg} style={{width:200,height:200}}/>
                    <a style={{marginTop:10, fontFamily:"sans-serif", fontSize:"1.5em"}}>Swap</a>
                </div>
                <div style={{backgroundColor:"white", padding:'30px', margin:10, borderRadius:30}} onClick={()=>updateBlinkObjectTemplate(2)} >
                    <img src = {templateImg} style={{width:200,height:200}}/>
                    <a style={{marginTop:10, fontFamily:"sans-serif", fontSize:"1.5em"}}>Bridge</a>

                </div>
                <div style={{backgroundColor:"white", padding:'30px', margin:10, borderRadius:30}} onClick={()=>updateBlinkObjectTemplate(3)}>
                    <img src = {templateImg} style={{width:200,height:200}}/>
                    <a style={{marginTop:10, fontFamily:"sans-serif", fontSize:"1.5em"}}>Ad</a>

                </div>
                <div style={{backgroundColor:"white", padding:'30px', margin:10, borderRadius:30}} onClick={()=>updateBlinkObjectTemplate(4)}>
                    <img src = {templateImg} style={{width:200,height:200}}/>
                    <a style={{marginTop:10, fontFamily:"sans-serif", fontSize:"1.5em"}}>Stake</a>

                </div>
            </div>

            <button className="launch-app-button" style={{color:'black', marginTop:10, fontSize:"1.2em"}} onClick={handleScroll}>{currentBlinkObjectState?"Next":"Choose a template"}</button>
        </div>
    )
}

export default CreateBlink1