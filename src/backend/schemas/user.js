import mongoose, { mongo } from "mongoose";

const {Schema} = mongoose

const userSchema = new Schema({
    userId: Schema.Types.ObjectId,
    email: String,
    username: String,
})

export const User = mongoose.model("User", userSchema)
