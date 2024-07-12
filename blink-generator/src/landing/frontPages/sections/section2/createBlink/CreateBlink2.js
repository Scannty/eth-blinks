import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import EditElement from "../../../../components/EditElement";


function CreateBlink2({currentBlinkObject, setCurrentBlinkObject}){
    const [color, setColor] = useState("#aabbcc");
    return(
        <div style={{backgroundColor:"#ffa433" }}> 
        <h3>Let's Custumize Your Blink</h3>

        <EditElement/>
        </div>
    )
}

export default CreateBlink2