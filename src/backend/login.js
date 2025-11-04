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
import axios from "axios";

/**
 * TODOS:
 * - make sure that the session id generated don't clash
 * - set the appropriate cookie settings (httpOnly, etc) for relevant cookies (e.g: sessionId httpOnly, csrfToken not httpOnly)
 * - create a hash for the cookies
 */

const router = express.Router()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });
const app = express()

const port = 3000

// router.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     allowedHeaders: "Content-Type"
// }))
router.use(cookieParser())

const mongoConnectionUrl = process.env.MONGODB_CONNECTION_URL
console.log("connecting");
await mongoose.connect(mongoConnectionUrl)
console.log("connected");

//to be changed
const redirect_uri = "http://localhost:3000/google/callback"
const tempSessionExpiry = 3600000 //1 hour
var testState = ""

// handles preflight request
router.options("/check-session", (req, res)=>{
    //request header for what the actual request may include, need to say browser is allowed to include content-type in header
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set("Access-Control-Allow-Credentials", true)
    res.set("Access-Control-Allow-Origin", "http://localhost:5173")
    res.send("Set the stuff")
})


router.post("/check-session", async (req, res)=>{
    try{
        res.set("Access-Control-Allow-Credentials", true)
        res.set("Access-Control-Allow-Origin", "http://localhost:5173")
        const cookies = req.cookies
        //case no session id
        if (cookies.session == null){
            // const sessionId = crypto.randomUUID()
            // const state = crypto.randomUUID()
            // const nonce = crypto.randomUUID()
            // await handleNoSession(sessionId, state, nonce)
            // res.cookie("session", sessionId)
            // res.send({isLoggedIn: false})
            const values = await handleNoSession()
            res.cookie("session", values[1], {
                expires: values[2]
            })
            if(values[0]){
                res.cookie("hasSession", "1")
            }else{
                res.clearCookie("hasSession")
            }
            res.send({isLoggedIn: values[0]})
        }else if(cookies.session != null){ //case there is session id
            const values = await handleSession(cookies.session)
            res.cookie("session", values[1], {
                expires: values[2]
            })
            if(values[0]){
                res.cookie("hasSession", "1")
            }else{
                res.clearCookie("hasSession")
            }
            res.send({isLoggedIn: values[0]})
        }else{
            throw new Error("Issue with checking session server side")
        }
    }catch(error){
        res.status(400)
        res.send({isLoggedIn: false, message: "Internal error"})
        console.log("Error creating session:", error);
    }
})

//handles the sessionid exists case
//returns 3 values, stored in an array
//first value (boolean) returns whether the user should be considered logged in
//second value returns the new sessionId
//third value returns the expiry
async function handleSession(sessionId){
    try{

        const session = await Session.findOne({
            sessionId: sessionId,
            expiresAt: {$gt: Date.now()}
        })
        console.log("Session from handleSession:", session);
        if (session != null){
            return [session.userId != null, session.sessionId, session.expiresAt]
        }else{
            return await handleNoSession()
        }
    }catch(error){
        console.error(error)
    }
}

//creates a session in the database and returns the state and nonce tokens
async function handleNoSession(){
    const newSessionId = crypto.randomUUID()
    const expiry = new Date(Date.now() + tempSessionExpiry);
    const session = await Session.create({
        userId: null,
        sessionId: newSessionId,
        expiresAt: expiry
    })
    return [false, newSessionId, expiry]
}

//for testing purposes
router.get("/reset-sessions", async (req, res)=>{
    await Session.deleteMany({})
    res.send("Reset sessions collection")
})

// router.get("/create-session-get", (req, res)=>{
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


router.options("/login", (req, res)=>{
    // console.log("Optioning it rn");
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set("Access-Control-Allow-Credentials", true)
    res.set("Access-Control-Allow-Origin", "http://localhost:5173")
    res.send("Preflighted login")
})

/**
 * need a nonce token because it ensures that the code is only used once, if the code is intercepted, it will not
 * be traded for a user email and create a new session, because it means the code has been used or compromised
 */
router.post("/login", async (req, res)=>{
    try{
        // console.log("Logging in backend");
        res.set("Access-Control-Allow-Credentials", true)
        res.set("Access-Control-Allow-Origin", "http://localhost:5173")
        // console.log("Logging in");
        const cookies = req.cookies
        const stateToken = crypto.randomUUID();
        const nonce = crypto.randomUUID();
        const currentSession = await Session.findOne({
            sessionId: cookies.session
        })
        // console.log("currentSession:", currentSession);
        //binds state to session
        //need to hash this before storing in database
        await currentSession.updateOne({
            $set: {
                state: stateToken,
                nonce: {
                    value: nonce,
                    isUsed: false
                }
            }
        })
        const url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=" + process.env.GOOGLE_CLIENT_ID +
        "&response_type=" + "code" +
        "&scope=" + "openid%20email" +
        "&redirect_uri=" + redirect_uri +
        "&state=" + stateToken +
        "&nonce=" + nonce +
        "&login_hint=sub"
        res.send({url: url})
    }catch (error){
        console.error("Error redirecting:", error);
    }
})


/**
 * todos:
 * exchange the jwt for the user email, check if they are in the database and update
 * session information accordingly, and make sure to update the state and nonce tokens
 */
router.get("/google/callback", async (req, res)=>{
    //currently going back to the homepage
    try{
        const returnedState = req.query.state
        const cookies = req.cookies
        const session = await Session.findOne({
            sessionId: cookies.session
        })
        if(session.state != returnedState){
            console.log("State mismatched");
            res.status(400).send({error: "Rejected due to state mismatch"})
        }
        const response = await axios.post("https://oauth2.googleapis.com/token", {
            code: req.query.code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: "http://localhost:3000/google/callback",
            grant_type: "authorization_code"
        })
        const jwt = response.data.id_token.split(".")
        const payload = JSON.parse((atob(jwt[1])))
        const user = await User.findOne({
            userId: payload.sub
        })
        const loggedInSession = crypto.randomUUID()
        const csrfToken = crypto.randomUUID()
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 7)
        if(user == null){
            const newUser = await User.create({
                userId: payload.sub,
                email: payload.email
            })
        }
        await Session.deleteMany({
                userId: payload.sub
            })
        const createdSession = await Session.create({
            userId: payload.sub,
            sessionId: loggedInSession,
            expiresAt: expiry,
            state: null,
            csrfToken: csrfToken
        })
        res.cookie("session", loggedInSession, {
            expires: expiry
        })
        res.cookie("csrf_token", csrfToken)
        res.cookie("hasSession", "1")
        res.redirect("http://localhost:5173") //this should automatically check the session and log in
        }catch(error){
            console.log("Error:", error);
        }
})

export {router as loginRouter}