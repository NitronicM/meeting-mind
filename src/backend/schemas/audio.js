import mongoose from "mongoose";

const {Schema} = mongoose

const audioSchema = new Schema({
    userId: String,
    name: String,
    dateAdded: Date,
    filePath: String, //stored in bucket
    transcript: String,
    summary: String
})

export const Audio = mongoose.model("Audio", audioSchema)