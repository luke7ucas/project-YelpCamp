// routes/users.js

const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user.js');
const users = require('../controllers/users.js');



router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));


router.route('/login')
    .get(users.userRenderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);


router.get('/logout', users.logout);



module.exports = router;