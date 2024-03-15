const express = require("express")
const verifyToken = require("../middlewares/verifyToken");
const Post = require("../models/post");
const User = require("../models/user");
const postRouter = express.Router()

postRouter.post("/create", verifyToken, async (req, res) => {
    try {
        const userId = req.id;
        const { description } = req.body;
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
        }
        if (!description) {
            return res.status(400).json({
                success: false,
                message: "Description is required."
            });
        }

        const post = await Post.create({
            description,
            user: {
                userId: existingUser._id,
                name: existingUser.name,
                username: existingUser.username,
            }
        });

        res.status(201).json({
            success: true,
            message: "Tweet created successfully.",
            post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

//get All Post

postRouter.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized !"
            })
        }
        const posts = await Post.find({})
        res.status(200).json({
            success: true,
            posts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

//get post for specific user
postRouter.get("/user", verifyToken, async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized !"
            });
        }

        const posts = await Post.find({ 'user.userId': userId }); 

        res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



postRouter.delete("/delete/:id",verifyToken,async(req,res)=>{
    try{
        const userId = req.id
        const postId = req.params.id
        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found."
            })
        }
        const deletedPost = await Post.findById(postId)
        if(!deletedPost){
            return res.status(400).json({
                success:false,
                message:"Tweet not found."
            })
        }
        res.status(200).json({
            success:true,
            message:"Tweet deleted successfully."
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
})

postRouter.put("/like/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        // Check if the user already liked the post
        const alreadyLikedIndex = post.likes.findIndex(id => id.toString() === userId);
        if (alreadyLikedIndex !== -1) {
            // User already liked the post, remove like
            post.likes.splice(alreadyLikedIndex, 1);
        } else {
            // User did not like the post, add like
            post.likes.push(userId);
        }

        // Save the updated post
        await post.save();

        res.status(200).json({
            success: true,
            message: "Post like updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});





module.exports = postRouter