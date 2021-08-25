// cloudinary/index.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YelpCamp1',  // uploaded to YelpCamp folder on cloudinary
        allowedFormats: ['jpeg', 'png', 'jpg']  // formats allowed for upload
    }
});


module.exports = {
    cloudinary,
    storage
}