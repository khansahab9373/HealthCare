import AuditLog from "../models/AuditLog.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(200);
    return sendSuccess(res, logs, "Audit logs fetched successfully.");
  } catch (error) {
    return sendError(res, error.message || "Unable to fetch audit logs.", 500);
  }
};
