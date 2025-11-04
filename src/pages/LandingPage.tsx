import "./css/landing-page.css"
import "../index.css"
import { useEffect } from "react"
import axios from "axios"

const login_url = "http://localhost:3000/login"
const baseUrl = "http://localhost:3000/"

export default function LandingPage() {

  /**
   * the credentials property of xmlhttprequest is what determines if set-cookie header is
   * respected by the browser, thats why you need to do withCredentials = true for it to work
   * the post request is technically cross-origin, and the credentials is set to same-origin by default,
   * which is why localhost:3000 was setting the cookies and not localhost:5173
   * 
   * documentation linkes: 
   * https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
   */
  async function onGetStarted(){
    const url = baseUrl + "login"
    console.log(url);
    await axios.post(url, {
      //data to be sent
    }, {
      withCredentials: true
    })
    .then(response => {
      console.log("response after login:", response)
      window.location.href = response.data.url
    })
    .catch(error => console.error("Error: ", error))
    // await axios.get(url + "-get", {
    //   withCredentials: true,
    // })
    // .then(response => {
    //   console.log(response)
    // })
    // .catch(error => console.error("Error: ", error))
    // window.location.href = login_url
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