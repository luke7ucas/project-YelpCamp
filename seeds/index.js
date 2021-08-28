// seeds/index.js

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 150; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // YOUR USER ID
            author: '6116aa5742b56904483beb5e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type : "Point", 
                coordinates : [ 
                    cities[random1000].longitude, 
                    cities[random1000].latitude,
            ] 
            },
            images: [
                { 
                  url: 'https://res.cloudinary.com/luke7ucas/image/upload/v1629668236/YelpCamp/zfdwm83hvbbx9p5c0byx.jpg',
                  filename: 'YelpCamp/zfdwm83hvbbx9p5c0byx'
                },
                {
                  url: 'https://res.cloudinary.com/luke7ucas/image/upload/v1629928238/YelpCamp/Sunset-over-tents-in-Suffolk_qwv1bo.jpg',
                  filename: 'YelpCamp/Sunset-over-tents-in-Suffolk_qwv1bo'
                }
              ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})