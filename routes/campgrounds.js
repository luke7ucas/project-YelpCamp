// routes/campgrounds.js

const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds.js');   // new
const catchAsync = require('../utils/catchAsync');
// const { campgroundSchema } = require('../schemas.js');
// const ExpressError = require('../utils/ExpressError');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');

// ROUTES


router.route('/')
    .get(catchAsync(campgrounds.index))

    .post(
        isLoggedIn,
        upload.array('images'),
        validateCampground,
        catchAsync(campgrounds.createCampground));



router.get('/new', isLoggedIn, campgrounds.renderNewForm);



router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(
        isLoggedIn,
        isAuthor,
        upload.array('images'), // where is this 'images' coming from?
                                // from: 
        validateCampground,
        catchAsync(campgrounds.updateCampground))
    .delete(
        isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.deleteCampground));



router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;