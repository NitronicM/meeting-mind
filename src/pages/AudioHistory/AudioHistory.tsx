import { useEffect, useState } from "react"
import AudioHistoryTable from "./AudioHistoryTable"
import axios from "axios";
import {saveAs} from "file-saver"


const baseUrl = "http://localhost:3000"

export default function AudioHistory(){
    const style = {
        display: "flex",
        justifyContent: "center",
        fontSize: "xx-large",
        marginTop: "50px"
    }
    const [audios, setAudios] = useState([]);
    async function fetchAudios(){
        try{
            const url = baseUrl + "/audios/audios"
            const response = await axios.get(url, {
                withCredentials: true
            })
            setAudios(response.data.audios)
            console.log(audios);
        }catch(error){
            console.log("Error getting audios:", error);
        }
    }

    async function deleteAudio(item: any){
        const url = baseUrl + "/audios/audio"
        const csrfToken = document.cookie.split("; ")
                                .find(c => c.startsWith("csrf_token="))
                                ?.split("=")[1] || null
        const response = await axios.delete(url, {
            data: {
                csrfToken: csrfToken,
                fileName: item.name
            },
            withCredentials: true
        })
        fetchAudios()
    }

    async function downloadAudio(item: any){
        try{
            const url = baseUrl + "/audios/presigned-audio-download" + "?fileName=" + item.name
            const presignedResponse = await axios.get(url, {
                withCredentials: true
            })
            console.log(presignedResponse.data.presignedUrl);
            const response = await axios.get(presignedResponse.data.presignedUrl, {
                responseType: "blob"
            })
            console.log(response.data);
            saveAs(response.data, item.name)
        }catch(error){
            console.log("Error downloading audio:", error);
        }
    }

    useEffect(()=>{
        (async () => {
            await fetchAudios()
        })()
    }, [])

    return(
        <div style={style}>
            <AudioHistoryTable  items={audios} 
                                onDelete={e=>deleteAudio(e)}
                                onDownload={e=>downloadAudio(e)}
            />
        </div>
    )
}