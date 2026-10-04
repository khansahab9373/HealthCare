import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET?.trim()) {
      throw new Error(
        "JWT_SECRET must be configured before starting the server.",
      );
    }
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`BloodCare server is running on http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the existing server or set a different PORT.`,
        );
      } else {
        console.error(`Server failed to listen: ${error.message}`);
      }
      process.exitCode = 1;
    });

    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down BloodCare server.`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error(`BloodCare startup failed: ${error.message}`);
    process.exitCode = 1;
  }
};

startServer();
