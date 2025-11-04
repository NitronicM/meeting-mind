import mongoose from "mongoose";

const {Schema} = mongoose

const sessionSchema = new Schema({
    userId: String,
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
    csrfToken: String,
})

export const Session = mongoose.model("Session", sessionSchema)
