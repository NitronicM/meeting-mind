import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url";
import express from "express"
import multer from "multer";
import cors from "cors"
import fs from "fs"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express()
app.use(cors({ origin: "http://localhost:5173" }))
const port = 3001

// const upload = multer({storage: multer.memoryStorage()})
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "./uploads")
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname)
    }
})
const upload = multer({storage: fileStorage})
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


app.post("/analyze-file", upload.single("fileToAnalyze"), async (req, res)=>{
    try{
        console.log("Here0");
        console.log("originalname: ", req.file.originalname);
        console.log("path:", req.file.path);
        const myfile = await ai.files.upload({
            file: req.file.path,
            config: { mimeType: req.file.mimetype },
        });
        const summary = await getAudioSummary(myfile)
        const transcript = await getAudioTranscript(myfile)
        console.log("Summary:", summary);
        console.log("Transcript:", transcript);
        fs.unlink(req.file.path, (error)=>{
            if (error){
                console.error("Error removing file", error)
            }
        })
        res.send({  status: 200,
                    summary: summary,
                    transcript: transcript})
    }catch(error){
        console.log("Error", error);
        res.send({status: 400, error: "Error getting summary"})
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


app.listen(port, ()=>{
    console.log("Listening on port", port);
})