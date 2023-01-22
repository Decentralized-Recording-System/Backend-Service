const express = require('express');
const router = express.Router();
const cleanBody = require('../middlewares/cleanbody');
const AuthController = require('../controllers/company/company.controller');
const verifyAuth = require('../middlewares/validateToken');

// for auternicatin
router.post('/register', cleanBody, AuthController.Register);
router.post('/login', cleanBody, AuthController.Login);
router.post('/activate', cleanBody, AuthController.Activate);
router.get('/activate', cleanBody, AuthController.ReActivate);
router.get('/password', cleanBody, AuthController.ForgotPassword);
router.patch('/password', cleanBody, AuthController.ResetPassword);
router.get('/logout', verifyAuth, AuthController.Logout);
router.get('/access', verifyAuth, AuthController.CheckAccessToken);
router.get('/drivingdata',verifyAuth,AuthController.GetAllUserDrivingData)
module.exports = router;
