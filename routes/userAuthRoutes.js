// userRoutes.js

const express = require("express");
const router = new express.Router();
const userController = require("../controllers/userControllers");
const userUpload = require("../multerConfig/userConfig");

// user routes
router.post("/register", userUpload.array("userimg"), userController.ImageUpload);
router.get("/getUser", userController.getUserdata);
router.delete("/delete/:username", userController.deleteUser); // Add delete user route

module.exports = router;
