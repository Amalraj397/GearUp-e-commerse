
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import  cloudinary from "../Config/cloudinary_Config";
// const path = require("path");

// export function uploadMiddleware(folderName) {
//     const storage = new CloudinaryStorage({
//       cloudinary: cloudinary,
//       params: (req, file) => {

//         const folderPath = `${folderName.trim()}`;
//         const fileExtension = path.extname(file.originalname).substring(1);
//         const publicId = `${file.fieldname}-${Date.now()}`;
//         return {

//           folder: folderPath,
//           public_id: publicId,
//           format: fileExtension,
//         };
//       },
//     });
  
//     return multer({
//       storage,
//       limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//     });
//   }


// ------------------------  new------  29/04/  07:10pm
// uploadMiddleware.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Config/cloudinary_Config.js'; // ✅ import only config
import path from 'path';

export function uploadMiddleware(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => ({
      folder: folderName.trim(),
      public_id: `${file.fieldname}-${Date.now()}`,
      format: path.extname(file.originalname).substring(1),
    }),
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
  });
}
