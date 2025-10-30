import axios from "axios";
import { useEffect, useState } from "react";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard/Dashboard";
import DashboardHeader from "./Dashboard/DashboardHeader";
import AnalyzeAudio from "./AnalyzeAudio/AnalyzeAudio";
import AudioHistory from "./AudioHistory/AudioHistory";


export default function AppRouter(){
    // console.log("Here");
    const baseUrl = "http://localhost:3000/"
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(()=>{
        console.log("Here");
        const url = baseUrl + "check-session"
        axios.post(url, {}, {
            withCredentials: true
        }).then(response => {
            console.log("response:", response.data);
            const isLoggedIn = response.data.isLoggedIn
            setIsAuthenticated(isLoggedIn)
        })
    }, [])

    return(
        <div>
            {isAuthenticated ? <Dashboard/> : <LandingPage/>}
        </div>
    )
}