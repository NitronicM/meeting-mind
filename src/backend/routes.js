import express from "express"
import { loginRouter } from "./login.js"
import { googleApiRouter } from "./google_api.js"
import { amazonS3Router } from "./amazon_s3.js"
import cookieParser from "cookie-parser"
import { Session } from "./schemas/session.js"
import cors from "cors"

const port = 3000
const url = "http://localhost:5173"
const app = express()
app.use(express.json())
app.use(cookieParser())
const corsOptions = {
    origin: url,
    credentials: true,
    allowedHeaders: "Content-Type",
}

app.use(cors(corsOptions))

/**
 * todos:
 * write middleware so that the amazons3Router and googleApiRouter check the session and stuff
 * refactor literally everything and clean it all up
 */

const verifyRequest = async function(req, res, next){
    try{
        let session
        if (req.method != "GET"){
            const cookies = req.cookies
            const sessionId = cookies.session
            if (!sessionId){
                res.status(403).send({message: "Access denied - first"})
                return
            }
            session = await Session.findOne({
                sessionId: sessionId,
                expiresAt: {$gt: Date.now()}
            })
            if (!session || !session.userId){
                res.status(403).send({message: "Access denied - second"})
                return
            }
            const csrfTokenClient = req.body.csrfToken
            if (!csrfTokenClient || csrfTokenClient != session.csrfToken){
                res.status(403).send({message: "Access denied - third"})
                return
            }
        }
        req.body.session = session
        req.body.userId = session.userId
        next()
    }catch(error){
        console.log("Error with verify request middleware:", error);
        res.status(500).redirect(url)
    }
}

app.use(loginRouter)
app.use(verifyRequest, amazonS3Router)
app.use(verifyRequest, googleApiRouter)

app.listen(port, ()=>{
    console.log("Listening on port 3000");
})