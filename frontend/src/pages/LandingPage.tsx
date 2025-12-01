import "./css/landing-page.css"
import "../index.css"
import axios from "axios"

const baseUrl = import.meta.env.VITE_BASE_URL

export default function LandingPage() {

  async function onGetStarted(){
    const login_url = baseUrl + "/auth/login"
    console.log("base:",baseUrl);
    await axios.post(login_url, {
    }, {
      withCredentials: true
    })
    .then(response => {
      window.location.href = response.data.url
    })
    .catch(error => console.error("Error logging in: ", error))
  }

  return (
    <div id="container">
      <div id="landing-page-header">
        <h1 id="header-title">Meeting Mind</h1>
        <button onClick={onGetStarted} id="get-started-btn">
          Get started
          </button>
      </div>
      <div id="landing-page-body">
        <h1>Summarize, transcribe and translate your audio</h1>
      </div>
    </div>
  );
}