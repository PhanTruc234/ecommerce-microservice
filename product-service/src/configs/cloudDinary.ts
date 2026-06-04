import "dotenv/config"
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
    cloud_name: process.env.CLOUD_DINARY_NAME,
    api_key: process.env.CLOUD_DINARY_KEY,
    api_secret: process.env.CLOUD_DINARY_SECRET,
});
export default cloudinary;