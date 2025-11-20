import express from "express"
import { fileURLToPath } from "url";
import path from "path"
import dotenv from "dotenv"
import {S3Client, 
        PutObjectCommand,
        CreateBucketCommand,
        DeleteObjectCommand,
        DeleteBucketCommand,
        paginateListBuckets,
        GetObjectCommand} from "@aws-sdk/client-s3"
import { Session } from "./schemas/session.js";
import { GetSessionTokenCommand, STS, STSClient } from "@aws-sdk/client-sts";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
import { User } from "./schemas/user.js";
import { Audio } from "./schemas/audio.js";
import { checkIfAudioExists } from "./middlewares.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const accessKey = process.env.AMAZON_ACCESS_KEY
const secretKey = process.env.AMAZON_SECRET_ACCESS_KEY
const awsStsRegion = process.env.AMAZON_STS_REGION

/**
 * todos:
 * 
 * add middleware so that all routes are protected, should validate the session and csrf token
 */

const router = express.Router()
router.use(express.json())

const bucketName = process.env.BUCKET_NAME

router.options("/presigned-url", (req, res)=>{
    //request header for what the actual request may include, need to say browser is allowed to include content-type in header
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set("Access-Control-Allow-Credentials", true)
    res.set("Access-Control-Allow-Origin", "http://localhost:5173")
    res.send("Set the stuff")
})

/**
 * todos:
 * - check if the file exists inside mongodb for that user
 * - store the filename in mongodb 
 */
router.post("/presigned-url", checkIfAudioExists, async (req, res)=>{
    try{
        const awsSts = new STSClient({
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey
            },
            region: awsStsRegion,
        })
        
        
        let tempCredentials
        await awsSts.send(new GetSessionTokenCommand({
            DurationSeconds: 900
        })).then(response => {
            tempCredentials = response.Credentials
        }).catch(error =>{
            res.status(500).send({message: "Error getting presigned url"})
            console.log("Error getting temp credentials:", error);
        })
        const s3Client = new S3Client({
            credentials: {
                accessKeyId: tempCredentials.AccessKeyId,
                secretAccessKey: tempCredentials.SecretAccessKey,
                sessionToken: tempCredentials.SessionToken
            },
            region: awsStsRegion
        })
        const bucketName = process.env.BUCKET_NAME
        const objectKey = req.body.userId + "/" + req.body.fileName
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            ContentType: "audio/mpeg"
        })
        await Audio.create({
            userId: req.body.userId,
            name: req.body.fileName,
            dateAdded: Date.now(),
            filePath: objectKey, //stored in bucket
        })
        const presigned = await getSignedUrl(s3Client, command, {
            expiresIn: 10,
        })
        res.send({presignedUrl: presigned})
        console.log("Finished getting presigned url for upload");
    }catch(error){
        console.log("Error with presigned url");
        console.log(error);
        res.status(500).send({message: "Internal server error"})
    }
})

export async function getObjectForGoogleUpload(userId, fileName){
    const objectKey = userId + "/" + fileName
    // console.log("filename for get:", objectKey);
    const awsSts = new STSClient({
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey
            },
            region: awsStsRegion,
        })
        
        
    let tempCredentials
    await awsSts.send(new GetSessionTokenCommand({
        DurationSeconds: 900
    })).then(response => {
        // console.log("Temp:", response);
        tempCredentials = response.Credentials
    }).catch(error =>{
        res.status(500).send({message: "Error getting presigned url"})
        console.log("Error getting temp credentials:", error);
    })
    const s3Client = new S3Client({
        credentials: {
            accessKeyId: tempCredentials.AccessKeyId,
            secretAccessKey: tempCredentials.SecretAccessKey,
            sessionToken: tempCredentials.SessionToken
        },
        region: awsStsRegion
    })
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    })
    const url = await getSignedUrl(s3Client, command, {
        expiresIn: 10
    })
    console.log("Finished getting presigned url for download");
    return url
}

export {router as amazonS3Router}