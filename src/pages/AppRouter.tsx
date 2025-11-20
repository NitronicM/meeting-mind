import axios from "axios";
import { useEffect, useState } from "react";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard/Dashboard";
import DashboardHeader from "./Dashboard/DashboardHeader";
import AnalyzeAudio from "./AnalyzeAudio/AnalyzeAudio";
import AudioHistory from "./AudioHistory/AudioHistory";

const baseUrl = "http://localhost:3000/"

function getHasSessionCookie(){
    return document.cookie
    .split("; ")
    .some(c => c.trim().match("hasSession=1"));
}

/**
 * todos:
 * maybe add condition for useeffect including with buttons? like when they submit so they dont upload on invalid session
 */
export default function AppRouter(){
    // console.log("Here");
    const [isAuthenticated, setIsAuthenticated] = useState(getHasSessionCookie())
    useEffect(()=>{
        // const loggedInCookie = Boolean(document.cookie.split(";")
        // .find(c => c.startsWith("loggedin="))
        // ?.split("=")[1]) || false
        // setIsAuthenticated(loggedInCookie)
        console.log("Checking session");
        const url = baseUrl + "check-session"
        axios.post(url, {}, {
            withCredentials: true
        }).then(response => {
            console.log("response from check sessioon:", response.data);
            const isLoggedIn = response.data.isLoggedIn
            if (isLoggedIn){
                document.cookie = "hasSession=1"
            }else{
                document.cookie = "hasSession=0"
            }
            setIsAuthenticated(isLoggedIn)
        })
    }, [])
    return(
        <div>
            {(isAuthenticated) ? <Dashboard/> : <LandingPage/>}
        </div>
    )
}