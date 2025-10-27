import mongoose from "mongoose";

const {Schema} = mongoose

const sessionSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    session_id: String,
    expiry: Date,
    state: String,
    nonce: {
        value: String,
        isUsed: Boolean
    }
})

export const Session = mongoose.model("Session", sessionSchema)
