import mongoose from "mongoose";

const {Schema} = mongoose

const userSchema = new Schema({
    userId: String,
    email: String,
})

export const User = mongoose.model("User", userSchema)
