import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url";
import express from "express"
import multer from "multer";
import cors from "cors"
import fs from "fs"
import { getObjectPresignedUrl } from "./amazon_s3.js";
import axios from "axios";
import { checkIfAudioExists } from "./middlewares.js";
import { Audio } from "./schemas/audio.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express()
const router = express.Router()
// router.use(cors({ origin: "http://localhost:5173" }))


// const upload = multer({storage: multer.memoryStorage()})

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


/**
 * todos:
 * - add checkIfAudioExists middleware back
 * - add the transcript and summary to the database
 */
router.post("/analyze-file", checkIfAudioExists, async (req, res)=>{
    try{
        console.log("Getting file for google upload");
        const presignedUrl = await getObjectPresignedUrl(req.body.userId, req.body.fileName)
        const response = await axios.get(presignedUrl, {
            responseType: "arraybuffer"
        })
        //make type dynamic, should read from the database
        const blob = new Blob([response.data], {type: "audio/mpeg"})
        console.log("finished here");

        // res.status(200).send({message: "Sent from google"})

        const myfile = await ai.files.upload({
            file: blob,
            config: { mimeType:  "audio/mpeg"},
        });
        const summary = await getAudioSummary(myfile)
        const transcript = await getAudioTranscript(myfile)
        const audio = Audio.findOne({
            userId: req.body.userId
        })
        await audio.updateOne({
            $set: {
                summary: summary,
                transcript: transcript
            }
        })
        // console.log("Summary:", summary);
        // console.log("Transcript:", transcript);
        res.send({  status: 200,
                    summary: summary,
                    transcript: transcript})
    }catch(error){
        console.log("Error", error);
        res.send({status: 500, error: "Error getting summary"})
    }
})

//calls gemini api to get summary of audio, just to make the code cleaner
//file is the file that was uploaded to gemini
async function getAudioSummary(file){
    try{
        const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: createUserContent([
                createPartFromUri(file.uri, file.mimeType),
                "Summarize what is happening in this audio",
            ]),
        });
        return result.text
    }catch(error){
        console.log("Error getting summary", error);
    }
}

//same as function above but for getting transcript of audio
async function getAudioTranscript(file){
    try{
        const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: createUserContent([
                createPartFromUri(file.uri, file.mimeType),
                "Give a transcript of this audio",
            ]),
        });
        return result.text
    }catch(error){
        console.log("Error getting summary", error);
    }
}

export {router as googleApiRouter}