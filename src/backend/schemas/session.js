import mongoose from "mongoose";

const {Schema} = mongoose

const sessionSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    sessionId: String,
    expiresAt: {
        type: Date,
        expires: 0
    },
    state: String,
    nonce: {
        value: String,
        isUsed: Boolean
    },
})

export const Session = mongoose.model("Session", sessionSchema)
