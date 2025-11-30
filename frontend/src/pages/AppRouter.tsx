import axios from "axios";
import { useEffect, useState } from "react";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard/Dashboard";

const baseUrl = "http://localhost:3000"

function getHasSessionCookie(){
    return document.cookie
    .split("; ")
    .some(c => c.trim().match("hasSession=1"));
}


export default function AppRouter(){
    const [isAuthenticated, setIsAuthenticated] = useState(getHasSessionCookie())
    useEffect(()=>{
        const url = baseUrl + "/auth/check-session"
        axios.post(url, {}, {
            withCredentials: true
        }).then(response => {
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