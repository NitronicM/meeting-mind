import express from "express"
import { checkIfSessionIsValid, verifyRequest } from "./middlewares.js"
import { Audio } from "./schemas/audio.js"
import { getObjectPresignedUrl, presignedDeleteObject } from "./amazon_s3.js"
import axios from "axios"
import cookieParser from "cookie-parser"


const router = express.Router()
router.use(express.json())
router.use(cookieParser())

router.get("/audios", checkIfSessionIsValid, async (req, res) => {
    try{
        const audios = await Audio.find({
            userId: req.userId
        })
        res.status(200).send({
            audios: audios
        })
    }catch(error){
        console.log("Error with fetching audios:", error);
        res.status(500).send({message: "Server side error fetching audio"})
    }
})

router.get("/presigned-audio-download", checkIfSessionIsValid, async(req, res)=>{
    //check if the audio exists first
    const audio = await Audio.findOne({
        userId: req.userId,
        name: req.query.fileName
    })
    if(!audio){
        res.status(400).send({message: "Audio does not exist"})
        return
    }
    const presignedUrl = await getObjectPresignedUrl(req.userId, req.query.fileName)
    res.status(200).send({presignedUrl: presignedUrl})
})

router.delete("/audio", verifyRequest, async (req, res) => {
    try{
        const objectKey = req.body.userId + "/" + req.body.fileName
        const audio = await Audio.find({
            userId: req.body.userId,
            filePath: objectKey
        })
        if(!audio){
            res.status(400).send({message: "Audio doesn't exist"})
            return
        }
        const presignedUrl = await presignedDeleteObject(req.body.userId, req.body.fileName)
        const response = await axios.delete(presignedUrl)
        await Audio.deleteOne({
            userId: req.body.userId,
            filePath: objectKey
        })
        res.status(200).send({message: "Audio deleted successfully"})
    }catch(error){
        console.log("Error deleting audio");
        res.status(500).send({message: "Error deleting audio"})
    }
})


export {router as audioStorageRouter}