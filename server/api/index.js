import app from "../src/app.js";
import connectDB from "../src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();

    const requestUrl = new URL(req.url, "http://localhost");
    const rewrittenPath =
      requestUrl.pathname === "/api"
        ? requestUrl.searchParams.get("__bloodcare_path")
        : null;

    if (rewrittenPath === "/api" || rewrittenPath?.startsWith("/api/")) {
      requestUrl.searchParams.delete("__bloodcare_path");
      req.url = `${rewrittenPath}${requestUrl.search}`;
    } else if (
      requestUrl.pathname !== "/api" &&
      !requestUrl.pathname.startsWith("/api/")
    ) {
      req.url = `/api${requestUrl.pathname}${requestUrl.search}`;
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
