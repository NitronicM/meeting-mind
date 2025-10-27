import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors"
import mongoose, { mongo } from "mongoose";
import {User} from "./schemas/user.js";
import {Session} from "./schemas/session.js"
import {Audio} from "./schemas/audio.js"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });
const app = express()
const port = 3000

// app.use(cors())
app.use(cookieParser())

const mongoConnectionUrl = process.env.MONGODB_CONNECTION_URL
console.log(mongoConnectionUrl);
console.log("connecting");
await mongoose.connect(mongoConnectionUrl)
console.log("connected");

//to be changed
const redirect_uri = "http://localhost:3000/google/callback"

var testState = ""

//handles preflight request
app.options("/check-session", (req, res)=>{
    //request header for what the actual request may include, need to say browser is allowed to include content-type in header
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set("Access-Control-Allow-Credentials", true)
    res.set("Access-Control-Allow-Origin", "http://localhost:5173")
    res.send("Set the stuff")
})


app.post("/check-session", async (req, res)=>{
    try{
        res.set("Access-Control-Allow-Credentials", true)
        res.set("Access-Control-Allow-Origin", "http://localhost:5173")
        const cookies = req.cookies
        if (cookies.session == null){
            //this is the case when they are visiting for the first time or session expired
            const id = crypto.randomUUID()
            res.cookie("session", id, {
                maxAge: 300000 //5 minutes
            })
            // const session = new Session({
            //     session_id: id,
            //     expiry: Date.now() + 300000
            // })
            const session = await Session.create({
                session_id: id,
                expiry: Date.now() + 300000
            })
            await session.save()
        }
        res.send("Session created")
    }catch(error){
        console.log("Error creating session:", error);
    }

})

// app.get("/create-session-get", (req, res)=>{
//     res.set("Access-Control-Allow-Credentials", true)
//     res.set("Access-Control-Allow-Origin", "http://localhost:5173")
//     res.cookie("from", "get")
//     // res.set("Set-Cookie", "name=madhav")
//     res.send("hopefully its set")
// })


/**
 * need a state token here because it verifies that /login started the auth flow,
 * if there is no state token, the attacker could call /google/callback immediately and pass in their
 * own url, because callback simply takes the authorization code and trades it for the user email and logs them in,
 * but if the attacker makes the user call the /google/callback endpoint with the attacker's url, then the callback function
 * trades the attacker's authorization code (which they got from logging in themselves via google), for the attacker's email,
 * making the user log into the attacker's email thinking it's theirs
 * 
 * we also need to bind this to the browser's session because the state and code can be intercepted
 * before the callback function ever trades the code for the email, because the browser sees google's response
 * before it gets redirected, the session id is stored on the cookies
 */

/**
 * need a nonce token because it ensures that the code is only used once, if the code is intercepted, it will not
 * be traded for a user email and create a new session, because it means the code has been used or compromised
 */
app.get("/login", async (req, res)=>{
    try{
        console.log("Logging in");
        console.log(process.env.GOOGLE_CLIENT_ID);
        const stateToken = crypto.randomUUID();
        testState = stateToken
        const nonce = crypto.randomUUID();
        //bind the state token to the session id
        //need to hash this before storing in database
        const url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=" + process.env.GOOGLE_CLIENT_ID +
        "&response_type=" + "code" +
        "&scope=" + "openid%20email" +
        "&redirect_uri=" + redirect_uri +
        "&state=" + stateToken +
        "&nonce=" + nonce +
        "&login_hint=sub"
        res.redirect(url)
    }catch (error){
        console.error("Error redirecting:", error);
    }
})


app.get("/google/callback", (req, res)=>{
    //currently going back to the homepage
    console.log("Called back");
    console.log(req.url);
    if (req.query.state == testState){
        console.log("State matched!");
        console.log("Code: " + req.query.code);
    }else{
        console.log("State did not match");
        console.log("Intended state: " + testState);
        console.log("Intended state: " + req.query.state);
    }
    res.redirect("http://localhost:5173")
    console.log("Successful login via google");
})

app.listen(port, ()=>{
    console.log("Listening on port", port);
})