import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL); // for db connection
    console.log("db connected successfully");
  } catch (error) {
    console.error("db connection error", error);
    process.exit(1); //if their is any error exit frm the process
  }
};

export default dbConnect; // export the dbconnect function so that it can be used in other files
