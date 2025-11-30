import type { Dispatch, SetStateAction } from "react";
import "../css/dashboard-header.css"

export default function DashboardHeader({current_tab} : {current_tab : Dispatch<SetStateAction<string>>}){

    function changeToAnalyzeAudio(){
        current_tab("analyze_audio")
    }

    function changeToAudioHistory(){
        current_tab("audio_history")
    }

    return(
        <div>
            <div id="btn-container">
                <button onClick={changeToAnalyzeAudio} id="analyze-audio-btn">
                    Analyze Audio
                </button>
                <button onClick={changeToAudioHistory} id="audio-history-btn">
                    History
                </button>
            </div>
        </div>
    )
}