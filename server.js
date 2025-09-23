import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

import dbConnect from "./Config/db_config.js"; //db config file imported fro db connection

const serverStart = async () => {
  await dbConnect();

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
};

serverStart();
 