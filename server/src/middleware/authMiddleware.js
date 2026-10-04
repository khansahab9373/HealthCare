import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendError } from "../utils/apiResponse.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authentication token missing.", 401);
    }

    if (!process.env.JWT_SECRET) {
      return sendError(res, "Authentication service is not configured.", 500);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, "User not found.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token.", 401);
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Unauthorized.", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, "Access denied.", 403);
    }

    next();
  };

export const authorizeVerifiedTechnician = (req, res, next) => {
  if (
    req.user?.role !== "TECHNICIAN" ||
    req.user.technicianStatus !== "VERIFIED" ||
    !req.user.isActive
  ) {
    return sendError(
      res,
      "A verified active technician account is required.",
      403,
    );
  }
  next();
};
