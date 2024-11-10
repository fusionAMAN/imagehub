// userControllers.js

const userDB = require("../model/usermodel");
const fs = require('fs');
const path = require('path');

// Image Upload logic (already there)
exports.ImageUpload = async (req, res) => {
    const files = req.files.length > 0 ? req.files : [];
    const { username } = req.body;

    if (!username || files.length === 0) {
        return res.status(400).json({ error: "Username and images are required" });
    }

    try {
        // Check if the user already exists
        const preuser = await userDB.findOne({ username });

        if (preuser) {
            // User exists: append new images to their profile
            const newImageUrls = files.map(file => file.filename);
            preuser.userprofile.push(...newImageUrls);
            await preuser.save();

            return res.status(200).json({ message: "Images successfully added to existing user", userData: preuser });
        } else {
            // New user: create new record
            const imageUrls = files.map(file => file.filename);
            const userData = new userDB({
                username,
                userprofile: imageUrls,
            });

            await userData.save();
            return res.status(200).json({ message: "User created and images uploaded", userData });
        }
    } catch (error) {
        return res.status(500).json({ error: "Server error during image upload" });
    }
};

// Get user data
exports.getUserdata = async (req, res) => {
    try {
        const getUsers = await userDB.find();
        res.status(200).json(getUsers);
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

// Delete user logic
exports.deleteUser = async (req, res) => {
    const { username } = req.params;

    try {
        // Find the user to delete
        const user = await userDB.findOneAndDelete({ username });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Delete images from the server
        user.userprofile.forEach((image) => {
            const filePath = path.join(__dirname, "..", "useruploads", image);
            fs.unlink(filePath, (err) => {
                if (err) console.log("Error deleting file:", err);
            });
        });

        res.status(200).json({ message: "User and images deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
