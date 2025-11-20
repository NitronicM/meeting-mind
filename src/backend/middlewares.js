import { Audio } from "./schemas/audio.js";

/**
 * todos:
 * - add a check to see if the audio type is valid (audio only)
 */

export async function checkIfAudioExists(req, res, next){
    try{
        console.log(req.body);
        if(!req.body.userId || !req.body.fileName){
            res.status(400).send({message: "No userid or filename provided"})
            return
        }
        console.log("Middleware for checking audio called");
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
            console.log("Calling next in middleware");
            next()
        }
    }catch(error){
        console.log("Error with checking audio middleware:", error);
        res.status(500).send({message: "Internal server error with middleware"})
    }
}