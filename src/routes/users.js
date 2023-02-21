const express = require('express');
const userRouter = express.Router();
const cleanBody = require('../middlewares/cleanbody');
const AuthController = require('../controllers/users/user.controller');
const verifyAuth = require('../middlewares/validateToken');

// for auternicatin
userRouter.post('/register', cleanBody, AuthController.Register);
userRouter.post('/login', cleanBody, AuthController.Login);
userRouter.post('/activate', cleanBody, AuthController.Activate);
userRouter.get('/activate', cleanBody, AuthController.ReActivate);
userRouter.get('/password', cleanBody, AuthController.ForgotPassword);
userRouter.patch('/password', cleanBody, AuthController.ResetPassword);

userRouter.get('/logout', verifyAuth, AuthController.Logout);
userRouter.get('/user', verifyAuth, AuthController.GetUserData);
userRouter.get('/access', verifyAuth, AuthController.CheckAccessToken);
userRouter.get('/test-data',cleanBody,AuthController.TestData);
userRouter.get('/users',cleanBody,AuthController.GetUsers)

userRouter.post('/driving-data',cleanBody,AuthController.AddDrivingData);

module.exports = {userRouter};
