import AuditLog from "../models/AuditLog.js";

export const recordAudit = async ({
  actor = null,
  action,
  entityType,
  entityId = "",
  metadata = {},
  ipAddress = "",
}) =>
  AuditLog.create({
    actor,
    action,
    entityType,
    entityId: String(entityId),
    metadata,
    ipAddress,
  }).catch((error) => {
    console.error(`Audit logging failed: ${error.message}`);
  });
