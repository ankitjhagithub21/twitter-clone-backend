const express= require('express')
const verifyToken = require('../middlewares/verifyToken');
const User = require('../models/user');
const userRouter = express.Router()

userRouter.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.id;

        // Find the current user
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!"
            });
        }

        // Find all users except the current user
        const users = await User.find({ _id: { $ne: userId } });

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

userRouter.put("/follow/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.id;
        const followedUserId = req.params.id;

        // Find the current user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!"
            });
        }

        // Find the user being followed
        const followedUser = await User.findById(followedUserId);
        if (!followedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Check if the user is already following the specified user
        const isFollowing = user.following.includes(followedUserId);
        if (isFollowing) {
            // If already following, unfollow the user
            const index = user.following.indexOf(followedUserId);
            user.following.splice(index, 1);

            const followerIndex = followedUser.followers.indexOf(userId);
            followedUser.followers.splice(followerIndex, 1);
        } else {
            // If not already following, follow the user
            followedUser.followers.push(userId);
            user.following.push(followedUserId);
        }

        // Save changes to both users
        await Promise.all([followedUser.save(), user.save()]);

        res.status(200).json({
            success: true,
            message: isFollowing ? `${followedUser.username} unfollowed successfully.` : `${followedUser.username} followed successfully.`,
           
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



module.exports = userRouter