import express from "express"
import { loginRouter } from "./login.js"
import { googleApiRouter } from "./google_api.js"

const port = 3000

const app = express()

app.use(loginRouter)
app.use(googleApiRouter)


app.listen(port, ()=>{
    console.log("Listening on port 3000");
})