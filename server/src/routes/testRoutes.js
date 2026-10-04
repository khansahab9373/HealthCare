import express from "express";
import {
  createTest,
  getAllTests,
  getTestById,
  getAdminTests,
  updateTest,
  updateTestStatus,
} from "../controllers/testController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  validateTest,
  validateTestStatus,
} from "../validators/requestValidators.js";

const router = express.Router();

router.get("/", getAllTests);
router.get("/admin", protect, authorize("ADMIN"), getAdminTests);
router.get("/:id", getTestById);
router.post("/", protect, authorize("ADMIN"), validateTest, createTest);
router.patch("/:id", protect, authorize("ADMIN"), validateTest, updateTest);
router.patch(
  "/:id/status",
  protect,
  authorize("ADMIN"),
  validateTestStatus,
  updateTestStatus,
);

export default router;
