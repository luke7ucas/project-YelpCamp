// routes/reviews.js

const express = require('express');
const router = express.Router({ mergeParams: true });

// CONTROLLERS
const reviews = require('../controllers/reviews.js');
// ---


const Campground = require('../models/campground');
const Review = require('../models/review');


const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// JOI schema
const { reviewSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');


// ROUTES
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));





module.exports = router;