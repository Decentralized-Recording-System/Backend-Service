const express = require("express");
const router = express.Router();
const cleanBody = require("../middle-wares/clean-body");
const AuthController = require("../controllers/users/user.controller");
const verifyAuth = require("../middle-wares/validateToken");

router.post("/register", cleanBody, AuthController.Register);
router.post("/login", cleanBody, AuthController.Login);
router.post("/activate", cleanBody, AuthController.Activate);
router.get("/activate", cleanBody, AuthController.ReActivate);
router.get("/password", cleanBody, AuthController.ForgotPassword);
router.patch("/password", cleanBody, AuthController.ResetPassword);
router.get("/logout", verifyAuth, AuthController.Logout);

router.get("/access", verifyAuth, AuthController.CheckAccessToken);
router.get("/user", verifyAuth, AuthController.GetUserData);
router.post("/driving-data", verifyAuth, AuthController.AddDrivingData);
router.get("/driving-data", verifyAuth, AuthController.GetDrivingData);

// full in 22/3

module.exports = router;
