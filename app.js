  import express from "express";
  import session from "express-session";
  import cookieParser from "cookie-parser";
  import cors from "cors";
  

  const app = express();
  import dotenv from "dotenv";
  dotenv.config(); // to read sll frm .env
  import path from "path";
  import { fileURLToPath } from "url";

  import userRoute from "./Routes/userRoute.js";
  import adminRoute from "./Routes/adminRoute.js";

  import { setUserLocals } from "./middlewares/setUserLocals.js";
  import {
    cartCountMiddleware,
    wishlistCountmiddleware,
  } from "./middlewares/cartCount.js";

  import { errorHandler }from "./middlewares/errorHandler.js";
  import "./utils/offerScheduler.js";
  import "./utils/autocancelOrders.js";

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.set("view engine", "ejs");
  app.set("views", [
    path.join(__dirname, "Views/Admin"),
    path.join(__dirname, "Views/User"),
  ]);

  // Serve static files
  app.use(express.static(path.join(__dirname, "Public")));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // middlewares for parsing the reqq

  //handling the session

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        maxAge: 72 * 60 * 60 * 1000,
      },
    }),
  );



  app.use(cors());
  app.use(cookieParser());

  app.use(setUserLocals);
  app.use(cartCountMiddleware);
  app.use(wishlistCountmiddleware);
  app.use("/", userRoute);
  app.use("/admin", adminRoute);

  app.use((req, res) => {
    res.status(404).render("page-404");
  });

app.use(errorHandler);
  

  export default app;
