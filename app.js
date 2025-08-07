import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
import dotenv from 'dotenv';
dotenv.config();  //to read all frm .env
import path from "path";
import { fileURLToPath } from "url"; 

import userRoute from "./Routes/userRoute.js";
import adminRoute from "./Routes/adminRoute.js";

import { setUserLocals } from './middlewares/setUserLocals.js';
import { cartCountMiddleware,wishlistCountmiddleware} from './middlewares/cartCount.js'
// import cors from 'cors';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// app.use(cors());

app.set('view engine', 'ejs'); 
app.set("views", [
    path.join(__dirname, "Views/Admin"),
    path.join(__dirname, "Views/User")
]);
  // console.log("View Directories:", app.get("views"));   // debugging

  // Serve static files
app.use(express.static(path.join(__dirname, "Public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));    // middlewares for parsing the reqq


//handling the session 

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: false,
      maxAge: 72*60*60*1000
  }
}));

app.use(cors());
app.use(cookieParser());

app.use(setUserLocals);
app.use(cartCountMiddleware);
app.use(wishlistCountmiddleware);
app.use("/",userRoute);
app.use("/admin",adminRoute);


export default app;