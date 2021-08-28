// app.js
require('dotenv').config();
// if (process.env.NODE_ENV !== "production") {
//     require('dotenv').config();
// }

console.log('LOG FROM app.js:');
console.log('Is .env passing information correctly? : ', process.env.ENV_CHECK);
console.log(process.env.NODE_ENV);
console.log(typeof process.env.NODE_ENV);
console.log(process.env.NODE_ENV !== "production");
console.log('---');

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const mongoSanitize = require('express-mongo-sanitize'); // Mongo Query Injection tool

const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users.js');


// DATABASE CONNECTION
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
// ---



// APP CONFIG
const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());   // Mongo Query Injection tool



const sessionConfig = {
    secret: 'thisshouldbeabettersecet',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // a week from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
// ---


// PASSPORT middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ---


// FLASH middleware
app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.get('/', (req, res) => {
    res.render('home')
});


// RE: PASSPORT
app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'lukasz@gmail.com', username: 'lukasz' });
    const newUser = await User.register(user, 'randompassword');
    res.send(newUser);
})



// RE: ROUTER
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
// ---


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


// ERROR HANDLER
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})
/// ---

app.listen(3000, () => {
    console.log('Serving on port 3000')
})