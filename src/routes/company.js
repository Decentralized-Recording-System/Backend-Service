const express = require('express');
const companyRouter = express.Router();
const cleanBody = require('../middlewares/cleanbody');
const AuthController = require('../controllers/company/company.controller');
const verifyAuth = require('../middlewares/validateToken');

// for authentication
companyRouter.post('/register', cleanBody, AuthController.Register);
companyRouter.post('/login', cleanBody, AuthController.Login);
companyRouter.post('/activate', cleanBody, AuthController.Activate);
companyRouter.get('/activate', cleanBody, AuthController.ReActivate);
companyRouter.get('/password', cleanBody, AuthController.ForgotPassword);
companyRouter.patch('/password', cleanBody, AuthController.ResetPassword);
companyRouter.get('/logout', verifyAuth, AuthController.Logout);
companyRouter.get('/access', verifyAuth, AuthController.CheckAccessToken);
companyRouter.get('/drivingdata',verifyAuth,AuthController.GetAllUserDrivingData)

module.exports = { companyRouter};
