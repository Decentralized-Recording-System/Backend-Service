const express = require('express');
const router = express.Router();
const cleanBody = require('../middlewares/cleanbody');
const AuthController = require('../controllers/users/user.controller');

// for auternicatin
router.post('/signup', cleanBody, AuthController.Signup);

module.exports = router;
