import mongoose from "mongoose";

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGO_URI?.trim()) {
    throw new Error("MONGO_URI must be configured.");
  }

  if (!connectionPromise || mongoose.connection.readyState === 0) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then((connection) => {
        console.log(`MongoDB connected: ${connection.connection.host}`);
        return connection.connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        console.error("MongoDB connection failed:", error.message);
        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;
