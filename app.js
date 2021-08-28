// app.js

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

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
const helmet = require('helmet'); // Helmet helps you secure your Express apps by setting various HTTP headers. 

const MongoStore = require('connect-mongo');


const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users.js');


// DATABASE CONNECTION
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';    // saved for future development
// or 
//const dbUrl = 'mongodb://localhost:27017/yelp-camp';
// mongoose.connect('mongodb://localhost:27017/yelp-camp', { // saved for future development
mongoose.connect(dbUrl, {
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

// HELMET START ---
app.use(helmet());  // enables all 11 middlewares that helmet comes with, one of the policies (ContentSecurityPolicy) will not be happy with our app and this is addressed in note 567 this can be temporarily mitigated by the code below
// app.use(helmet({ contentSecurityPolicy: false}));

// TO ALLOW FOR EXCEPTIONS IN ContentSecurityPolicy in Helmet
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com"
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];


// HELMET CONFIGURATION
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/luke7ucas/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
// HELMET --stop

// CONNECT-MONGO

const secret = process.env.SECRET || 'thisshouldbeabettersecet';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret;
    }
});


store.on("error", function(e) {
    console.log("Session Store Error", e)
});

// EXPRESS SESSION
const sessionConfig = {
    store: store,   // or just store,
    name: 'session_amended',    // this is a security feature: to change your default name of the cookie from "session" to "session_amended"
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // simple security, out cookies are only accessible thorugh HTML and not thorugh JS
//        secure: true, // this will make this cookie work only over https but localhost is not https so we have to comment it out
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
// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'lukasz@gmail.com', username: 'lukasz' });
//     const newUser = await User.register(user, 'randompassword');
//     res.send(newUser);
// })



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