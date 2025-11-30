import express from "express"
import { loginRouter } from "./login.js"
import { googleApiRouter } from "./google_api.js"
import { amazonS3Router } from "./amazon_s3.js"
import cookieParser from "cookie-parser"
import { Session } from "./schemas/session.js"
import cors from "cors"
import { audioStorageRouter } from "./audio_storage.js"
import { verifyRequest } from "./middlewares.js"
// import { verifyRequest } from "./middlewares.js"

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


app.use("/auth", loginRouter)
app.use("/s3", verifyRequest, amazonS3Router)
app.use("/google-api", verifyRequest, googleApiRouter)
app.use("/audios", audioStorageRouter)

app.listen(port, ()=>{
    console.log("Listening on port 3000");
})