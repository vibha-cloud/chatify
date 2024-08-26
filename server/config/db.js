import mongoose from "mongoose";
import dotenv from "dotenv";
// import colors from "colors";

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB URI not found in environment variables");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`.blue.underline);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red.bold);
    process.exit(1); // Exit with a failure code
  }
};

export default connectDB;
