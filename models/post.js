const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    likes: {
        type: Array,
        default: []
    },
    user: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name:{
            type:String,
        },
        username: {
            type: String,

        }
    },

}, { timestamps: true })
const Post = mongoose.model('post', postSchema)
module.exports = Post