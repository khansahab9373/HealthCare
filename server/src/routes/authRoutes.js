import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import {
  validateLogin,
  validateProfile,
  validateRegistration,
} from "../validators/requestValidators.js";

const router = express.Router();
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

router.post("/register", authRateLimit, validateRegistration, registerUser);
router.post("/login", authRateLimit, validateLogin, loginUser);
router.get("/me", protect, getCurrentUser);
router.patch("/me", protect, validateProfile, updateCurrentUser);

export default router;
