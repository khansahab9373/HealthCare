import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", protect, authorize("ADMIN"), getAuditLogs);

export default router;
