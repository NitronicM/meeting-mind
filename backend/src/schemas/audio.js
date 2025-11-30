import mongoose from "mongoose";

const {Schema} = mongoose

const audioSchema = new Schema({
    userId: String,
    name: String,
    dateAdded: Date,
    filePath: String,
    transcript: String,
    summary: String
})

export const Audio = mongoose.model("Audio", audioSchema)