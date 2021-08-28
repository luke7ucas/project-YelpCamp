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
    console.log('from: seeds/index.js: Deleted all campgrounds.');
    for (let i = 0; i < 150; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // YOUR USER ID
            author: '612a9ca52e0f944ed824641d',
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
                  url: 'https://res.cloudinary.com/luke7ucas/image/upload/v1630182597/YelpCamp/ooggswowq3vgw50q2nhp.jpg',
                  filename: 'YelpCamp/ooggswowq3vgw50q2nhp'
                },
                {
                  url: 'https://res.cloudinary.com/luke7ucas/image/upload/v1630182596/YelpCamp/n2tepux6je3g9qp7n8fy.jpg',
                  filename: 'YelpCamp/n2tepux6je3g9qp7n8fy'
                }
              ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})