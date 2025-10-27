
import useAuth from "./useAuth"
import Dashboard from "../pages/Dashboard";
import LandingPage from "../pages/LandingPage";

export default async function AppRouter(){

    const isAuthenticated = await useAuth()
    console.log(isAuthenticated);

    return isAuthenticated ? <Dashboard/> : <LandingPage/>

}