const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    location:{
        type:String,
    },
    image:{
        type:String,
    },
    following:{
        type:Array,
        default:[]
    },
    followers:{
        type:Array,
        default:[]
    }

},{timestamps:true})
const User = mongoose.model('user',userSchema)
module.exports = User