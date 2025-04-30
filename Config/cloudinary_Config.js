// cloudinaryConfig.js
// import { v2 as cloudinary } from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// // import multer from 'multer';
// const path = require("path");

// cloudinary.config({
//   cloud_name: 'dklbmacnz',
//   api_key: '145259637339762', 
//   api_secret: 'kTYL68oxT30Kx5s3hpLcCbRN3Ig',
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'brands', // optional Cloudinary folder
//     allowed_formats: ['jpg', 'jpeg', 'png'],
//   },
// });

//  export const upload = multer({ storage });



// cloudinary_Config.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dklbmacnz',
  api_key: '145259637339762',
  api_secret: 'kTYL68oxT30Kx5s3hpLcCbRN3Ig',
});

export default cloudinary;

