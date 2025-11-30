import { Audio } from "./schemas/audio.js";
import { Session } from "./schemas/session.js";

const url = "http://localhost:5173"

//this is for csrf attacks and stuff
export const verifyRequest = async function(req, res, next){
    try{
        let session
        if (req.method != "GET"){
            const cookies = req.cookies
            const sessionId = cookies.session
            console.log("cookies:", req.cookies);
            console.log("session:", req.cookies.session);
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
            req.body.session = session
            req.body.userId = session.userId
        }
        next()
    }catch(error){
        console.log("Error with verify request middleware:", error);
        res.status(500).redirect(url)
    }
}


export async function checkIfAudioExists(req, res, next){
    try{
        if(!req.body.userId || !req.body.fileName){
            res.status(400).send({message: "No userid or filename provided"})
            return
        }
        const filePath = req.body.userId + "/" + req.body.fileName
        const audio = await Audio.findOne({
            userId: req.body.userId,
            filePath: filePath
        })
        if(audio?.transcript && audio?.summary){
            res.send({
                exists: true,
                transcript: audio.transcript,
                summary: audio.summary
            })
            console.log("Returned stored transcript + summary");
            return
        }else{
            if(!String(req.body.fileName).toLowerCase().endsWith(".mp3")){
                console.log("Incorrect file type");
                res.status(400).send({message: "Incorrect file type"})
                return
            }
            console.log("Calling next in middleware");
            next()
        }
    }catch(error){
        console.log("Error with checking audio middleware:", error);
        res.status(500).send({message: "Internal server error with middleware"})
    }
}

export async function checkIfSessionIsValid(req, res, next){
    try{
        if (!req.cookies.session){
            res.status(400).send({messag: "Invalid session"})
            return
        }
        const session = await Session.findOne({
            sessionId: req.cookies.session,
            expiresAt: {$gt: Date.now()}
        })
        if(!session || !session.userId){
            res.status(403).send({message: "Access Denied"})
            return
        }
        req.userId = session.userId
        next()
    }catch(error){
        console.log("Error with checkIfSessionIsValid middleware", error);
        res.status(500).send({message: "Server side error with validating session"})
    }
}