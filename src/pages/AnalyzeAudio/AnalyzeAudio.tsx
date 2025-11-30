import { useState } from "react"
import "../css/analyze-audio.css"
import axios from "axios"

export default function AnalyzeAudio(){
    const axiosOptions = {
        withCredentials: true
    }
    const baseUrl = "http://localhost:3000"
    const url = "http://localhost:3000/analyze-file"
    const [file, setFile] = useState<File | null>(null);
    const [summary, setSummary] = useState("")
    const [transcript, setTranscript] = useState()
    const [showSummary, setShowSummary] = useState(true)

    const onFileUpload = async () => {
        try{
            const getPresignedUrl = baseUrl + "/s3/presigned-url"
            const csrfToken = document.cookie.split("; ")
                                    .find(c => c.startsWith("csrf_token="))
                                    ?.split("=")[1] || null
            const presignedUrlResponse = await axios.post(getPresignedUrl, {
                csrfToken: csrfToken,
                fileName: file?.name
            }, axiosOptions)
            if (presignedUrlResponse.data.exists){
                setSummary(presignedUrlResponse.data.summary)
                setTranscript(presignedUrlResponse.data.transcript)
                return
            }
            const bucketPutResponse = await axios.put(presignedUrlResponse.data.presignedUrl, file, {
                headers: {
                    "Content-Type": "audio/mpeg"
                }
            })
            const googleUrl = baseUrl + "/google-api/analyze-file"
            const analysisResponse = await axios.post(googleUrl, {
                csrfToken: csrfToken,
                fileName: file?.name
            }, axiosOptions)
            setSummary(analysisResponse.data.summary)
            setTranscript(analysisResponse.data.transcript)

        }catch (error){
            console.log("Error with file upload", error);
        }
	};

    const buttons = [
        {name: "Summary"},
        {name: "Transcript"},
    ]

    return (
        <div className="outer-div">
            <div className="flex mt-10 items-center justify-center">
                <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-slate-800">Upload File</h2>
                    <input
                        type="file"
                        accept=".mp3"
                        name="fileToAnalyze"
                            className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-700
                                        file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2
                                        file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                        //@ts-ignore
                        onChange={(e)=>setFile(e.target.files[0])}
                                        />

                          <button 
                            className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            onClick={onFileUpload}
                            >
                                Submit
                            </button>
                </div>
            </div>
            <div id="analysis-container">
                <div id="btns-container">
                    <button onClick={(e)=>setShowSummary(true)} className="analyze-options-btns">Summary</button>
                    <button onClick={(e)=>setShowSummary(false)} className="analyze-options-btns">Transcript</button>
                </div>
                <textarea id="analysis-output" rows={10} cols={20} disabled value={showSummary ? summary : transcript}></textarea>
            </div>
        </div>
    )
}