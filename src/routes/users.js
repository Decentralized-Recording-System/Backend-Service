const express = require("express");
const router = express.Router();
const cleanBody = require("../middle-wares/clean-body");
const AuthController = require("../controllers/users/user.controller");
const verifyAuth = require("../middle-wares/validateToken");

// for auternicatin
router.post("/register", cleanBody, AuthController.Register);
router.post("/login", cleanBody, AuthController.Login);
router.post("/activate", cleanBody, AuthController.Activate);
router.get("/activate", cleanBody, AuthController.ReActivate);
router.get("/password", cleanBody, AuthController.ForgotPassword);
router.patch("/password", cleanBody, AuthController.ResetPassword);
router.get("/logout", verifyAuth, AuthController.Logout);

router.get("/user", verifyAuth, AuthController.GetUserData);
router.get("/access", verifyAuth, AuthController.CheckAccessToken);
router.get("/driving-data", verifyAuth, AuthController.GetDrivingData);
router.post("/driving-data", verifyAuth, AuthController.AddDrivingData);

module.exports = router;
