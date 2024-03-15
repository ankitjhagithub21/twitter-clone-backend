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
        userId:{
            type:String,
        },
        name:{
            type:String,
        },
        username: {
            type: String,

        },
        image:{
            type:String,
        }
    },

}, { timestamps: true })
const Post = mongoose.model('post', postSchema)
module.exports = Post