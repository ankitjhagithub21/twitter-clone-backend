const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const User = require('../models/user');

const userRouter = express.Router();

// Get users not followed
userRouter.get("/not-followed", verifyToken, async (req, res) => {
    try {
        const userId = req.id;
        
        // Find the current user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!"
            });
        }

        // Get all users that the current user is not following
        const notFollowedUsers = await User.find({ 
            _id: { $nin: [...user.following, userId] } // Exclude current user's ID
        });

        res.status(200).json({
            success: true,
            users: notFollowedUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Follow user route
userRouter.put("/follow/:id", verifyToken, async (req, res) => {
    try {
        const { id: userId } = req;
        const { id: followedUserId } = req.params;

        const user = await User.findById(userId);
        const followedUser = await User.findById(followedUserId);

        if (!user || !followedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user.following.includes(followedUserId)) {
            return res.status(400).json({ success: false, message: "You have already followed this user." });
        }

        followedUser.followers.push({ _id: user._id, name: user.name, username: user.username, image: user.image });
        user.following.push({ _id: followedUser._id, name: followedUser.name, username: followedUser.username, image: followedUser.image });

        await Promise.all([followedUser.save(), user.save()]);

        res.status(200).json({ success: true, message: `${followedUser.username} followed successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Unfollow user route
userRouter.put("/unfollow/:id", verifyToken, async (req, res) => {
    try {
        const { id: userId } = req;
        const { id: followedUserId } = req.params;

        const user = await User.findById(userId);
        const followedUser = await User.findById(followedUserId);

        if (!user || !followedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const followingIndex = user.following.findIndex(u => u._id.equals(followedUserId));
        if (followingIndex === -1) {
            return res.status(400).json({ success: false, message: "You are not following this user." });
        }

        user.following.splice(followingIndex, 1);

        const followerIndex = followedUser.followers.findIndex(u => u._id.equals(userId));
        if (followerIndex !== -1) {
            followedUser.followers.splice(followerIndex, 1);
        }

        await Promise.all([user.save(), followedUser.save()]);

        res.status(200).json({ success: true, message: `You have successfully unfollowed ${followedUser.username}.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all following users
userRouter.get("/following", verifyToken, async (req, res) => {
    try {
        const { id: userId } = req;
        const user = await User.findById(userId).populate('following', 'name username image');
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized!" });
        }
        res.status(200).json({ success: true, followingUsers: user.following });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all followers
userRouter.get("/followers", verifyToken, async (req, res) => {
    try {
        const { id: userId } = req;
        const user = await User.findById(userId).populate('followers', 'name username image');
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized!" });
        }
        res.status(200).json({ success: true, followers: user.followers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Remove follower
userRouter.put("/followers/remove/:id", verifyToken, async (req, res) => {
    try {
        const { id: userId } = req;
        const { id: followerId } = req.params;

        const user = await User.findById(userId);
        const follower = await User.findById(followerId);

        if (!user || !follower) {
            return res.status(404).json({ success: false, message: "User or follower not found." });
        }

        const userFollowerIndex = user.followers.findIndex(u => u._id == followerId );
        const followerFollowingIndex = follower.following.findIndex(u => u._id==userId);

        if (userFollowerIndex === -1) {
            return res.status(400).json({ success: false, message: "Follower not found." });
        }

        // Remove follower from user's followers list
        user.followers.splice(userFollowerIndex, 1);

        // Remove user from follower's following list
        follower.following.splice(followerFollowingIndex, 1);

        await user.save();
        await follower.save();

        res.status(200).json({ success: true, message: `Follower ${follower.username} removed successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// Update profile route
userRouter.put("/update", verifyToken, async (req, res) => {
    try {
        const { name, bio, location, image } = req.body;
        const { id: userId } = req;

        const user = await User.findByIdAndUpdate(userId, { name, bio, location, image }, { new: true });

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized!" });
        }

        res.status(200).json({ success: true, message: "Profile updated successfully.", user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = userRouter;
