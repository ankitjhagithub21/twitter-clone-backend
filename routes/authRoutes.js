const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const authRouter = express.Router()

//register route
authRouter.post("/register", async (req, res) => {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exist."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "Registration successful."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


//login route
authRouter.post("/login",async(req,res)=>{
    const {username,password} = req.body;

    if(!username || !password){
        return res.status(400).json({
            success:false,
            message:"All fields are required."
        })
    }
    try{

        const user = await User.findOne({username})

        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid username or password !"
            }) 
        }

        const comparePassword = await bcrypt.compare(password,user.password)

        if(!comparePassword){
            return res.status(400).json({
                success:false,
                message:"Invalid username or password !"
            }) 
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"})

        res.cookie('jwt', token, { 
                httpOnly: true,
                secure:true,
                sameSite:"none",
                expires:new Date(Date.now()+86400000) 
            
            });

        res.status(200).json({
            success:true,
            message:"Login Successfull."
        })


    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }

})

//logout route
authRouter.get("/logout",async(req,res)=>{
    try{
        res.cookie('jwt', '', { 
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires: new Date(0) 
          });
          
          res.status(200).json({ 
            success:true,
            message: 'Logout successful' 
        });

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }

})

//get user route
authRouter.get("/user",verifyToken,async(req,res)=>{
    try{
        const userId = req.id;
        const user = await User.findById(userId).select("-password") 
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found."
            })
        }
        res.status(200).json({
            success:true,
            message:"User found.",
            user
        })

        

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
})
module.exports = authRouter