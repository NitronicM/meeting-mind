import { useState } from "react";
import AnalyzeAudio from "./AnalyzeAudio";
import AudioHistory from "./AudioHistory";
import DashboardHeader from "./DashboardHeader";


export default function Dashboard(){
    const [current_tab, setCurrentTab] = useState("analyze_audio")
    return(
        <div>
            <DashboardHeader current_tab={setCurrentTab}/>
            {current_tab === "analyze_audio" ? <AnalyzeAudio/> : <AudioHistory/>}
        </div>
    )
}