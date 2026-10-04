import express from "express";
import {
  approveReport,
  downloadReport,
  getAdminReports,
  getMyReports,
  submitReport,
  markReportUnderReview,
  rejectReport,
  requestReportCorrection,
  publishReport,
} from "../controllers/reportController.js";
import {
  authorize,
  authorizeVerifiedTechnician,
  protect,
} from "../middleware/authMiddleware.js";
import { validateReport } from "../validators/requestValidators.js";

const router = express.Router();

router.get("/my", protect, authorize("PATIENT"), getMyReports);
router.get("/admin", protect, authorize("ADMIN"), getAdminReports);
router.post(
  "/appointments/:appointmentId",
  protect,
  authorize("TECHNICIAN"),
  authorizeVerifiedTechnician,
  validateReport,
  submitReport,
);
router.patch("/:id/approve", protect, authorize("ADMIN"), approveReport);
router.patch("/:id/review", protect, authorize("ADMIN"), markReportUnderReview);
router.patch("/:id/reject", protect, authorize("ADMIN"), rejectReport);
router.patch(
  "/:id/correction",
  protect,
  authorize("ADMIN"),
  requestReportCorrection,
);
router.patch("/:id/publish", protect, authorize("ADMIN"), publishReport);
router.get(
  "/:id/download",
  protect,
  authorize("PATIENT", "ADMIN"),
  downloadReport,
);

export default router;
