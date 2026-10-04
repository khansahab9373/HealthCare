import app from "../src/app.js";
import connectDB from "../src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.url !== "/api" && !req.url.startsWith("/api/")) {
      req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    }

    return app(req, res);
  } catch (error) {
    console.error("Vercel request initialization failed:", error.message);
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
    });
  }
}