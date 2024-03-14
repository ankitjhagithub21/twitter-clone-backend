require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDb = require('./db')
const authRouter = require('./routes/authRoutes')
const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()
const port = process.env.PORT || 3000

//database connection
connectDb()

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true
}))


app.use("/api/auth",authRouter)
app.use("/api/post",postRouter)
app.use("/api/users",userRouter)


app.get("/",(req,res)=>{
    res.send("Hello world")
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})