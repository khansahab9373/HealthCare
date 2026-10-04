import express from "express";
import {
  addBlockedSlot,
  deleteBlockedSlot,
  getMyAvailability,
  getTechnicians,
  updateMyAvailability,
  updateBlockedSlot,
  updateTechnicianStatus,
  updateTechnicianQualifications,
  uploadVerificationDocument,
  downloadVerificationDocument,
} from "../controllers/userController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { verificationUpload } from "../middleware/uploadMiddleware.js";
import {
  validateAvailability,
  validateBlockedSlot,
  validateStatus,
} from "../validators/requestValidators.js";

const router = express.Router();

router.get("/technicians", protect, authorize("ADMIN"), getTechnicians);
router.patch(
  "/technicians/:id/status",
  protect,
  authorize("ADMIN"),
  validateStatus(
    ["PENDING_VERIFICATION", "VERIFIED", "REJECTED", "SUSPENDED"],
    "technicianStatus",
  ),
  updateTechnicianStatus,
);
router.patch(
  "/technicians/:id/qualifications",
  protect,
  authorize("ADMIN"),
  updateTechnicianQualifications,
);
router.get(
  "/me/availability",
  protect,
  authorize("TECHNICIAN"),
  getMyAvailability,
);
router.post(
  "/me/verification-documents",
  protect,
  authorize("TECHNICIAN"),
  verificationUpload.single("document"),
  uploadVerificationDocument,
);
router.get(
  "/technicians/:id/documents/:documentId",
  protect,
  authorize("ADMIN", "TECHNICIAN"),
  downloadVerificationDocument,
);
router.put(
  "/me/availability",
  protect,
  authorize("TECHNICIAN"),
  validateAvailability,
  updateMyAvailability,
);
router.post(
  "/me/blocked-slots",
  protect,
  authorize("TECHNICIAN"),
  validateBlockedSlot,
  addBlockedSlot,
);
router.delete(
  "/me/blocked-slots/:slotId",
  protect,
  authorize("TECHNICIAN"),
  deleteBlockedSlot,
);
router.put(
  "/me/blocked-slots/:slotId",
  protect,
  authorize("TECHNICIAN"),
  validateBlockedSlot,
  updateBlockedSlot,
);

export default router;
