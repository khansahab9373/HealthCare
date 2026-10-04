import User from "../models/User.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { createNotification } from "../services/notificationService.js";
import { recordAudit } from "../services/auditService.js";
import fs from "fs";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import {
  deleteAsset,
  downloadBuffer,
  uploadBuffer,
} from "../services/cloudinaryStorage.js";

export const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: "TECHNICIAN" })
      .select("-password")
      .populate("qualifiedTests", "name code")
      .sort({ createdAt: -1 });

    return sendSuccess(res, technicians, "Technicians fetched successfully.");
  } catch (error) {
    return sendError(res, error.message || "Unable to fetch technicians.", 500);
  }
};

export const updateTechnicianQualifications = async (req, res) => {
  const qualifiedTests = req.body.qualifiedTests;
  if (
    !Array.isArray(qualifiedTests) ||
    qualifiedTests.some((testId) => !mongoose.isValidObjectId(testId))
  ) {
    return sendError(res, "Qualified tests must be valid test IDs.", 400);
  }
  const validTestIds = await mongoose
    .model("Test")
    .find({
      _id: { $in: qualifiedTests },
      active: true,
    })
    .distinct("_id");
  if (validTestIds.length !== new Set(qualifiedTests.map(String)).size) {
    return sendError(res, "Qualified tests must be active tests.", 400);
  }
  const technician = await User.findOneAndUpdate(
    { _id: req.params.id, role: "TECHNICIAN" },
    { qualifiedTests: validTestIds },
    { new: true, runValidators: true },
  )
    .select("-password")
    .populate("qualifiedTests", "name code");
  if (!technician) return sendError(res, "Technician not found.", 404);
  recordAudit({
    actor: req.user._id,
    action: "TECHNICIAN_QUALIFICATIONS_UPDATED",
    entityType: "User",
    entityId: technician._id,
    metadata: { qualifiedTests },
    ipAddress: req.ip,
  });
  return sendSuccess(res, technician, "Technician qualifications updated.");
};

export const updateTechnicianStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      "PENDING_VERIFICATION",
      "VERIFIED",
      "REJECTED",
      "SUSPENDED",
    ];
    const technicianStatus = req.body.technicianStatus || req.body.status;
    const rejectionReason = String(req.body.rejectionReason || "").trim();

    if (!allowedStatuses.includes(technicianStatus)) {
      return sendError(res, "Invalid technician status.", 400);
    }
    if (technicianStatus === "REJECTED" && !rejectionReason) {
      return sendError(res, "A rejection reason is required.", 400);
    }

    const technician = await User.findOneAndUpdate(
      { _id: req.params.id, role: "TECHNICIAN" },
      {
        technicianStatus,
        rejectionReason: technicianStatus === "REJECTED" ? rejectionReason : "",
        isActive: technicianStatus !== "SUSPENDED",
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!technician) {
      return sendError(res, "Technician not found.", 404);
    }

    await createNotification({
      recipient: technician._id,
      type: "TECHNICIAN_VERIFICATION",
      title: "Verification status updated",
      message: `Your technician verification status is now ${technicianStatus}.`,
    });
    recordAudit({
      actor: req.user._id,
      action: "TECHNICIAN_STATUS_UPDATED",
      entityType: "User",
      entityId: technician._id,
      metadata: { technicianStatus },
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      technician,
      "Technician status updated successfully.",
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to update technician status.",
      500,
    );
  }
};

export const getMyAvailability = async (req, res) => {
  const technician = await User.findOne({
    _id: req.user._id,
    role: "TECHNICIAN",
  }).select("availability blockedSlots");
  return sendSuccess(res, technician);
};

export const uploadVerificationDocument = async (req, res) => {
  if (!req.file?.buffer)
    return sendError(res, "A verification document is required.", 400);
  const name = String(req.body.name || req.file.originalname).trim();
  if (!name) {
    return sendError(res, "A document name is required.", 400);
  }
  let uploadedAsset;
  try {
    const formatByMimeType = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const format = formatByMimeType[req.file.mimetype];
    const resourceType =
      req.file.mimetype === "application/pdf" ? "raw" : "image";
    uploadedAsset = await uploadBuffer(req.file.buffer, {
      folder: "healthcare/verification",
      publicId: `technician-${req.user._id}-${randomUUID()}`,
      format,
      resourceType,
    });
    const technician = await User.findOneAndUpdate(
      { _id: req.user._id, role: "TECHNICIAN" },
      {
        $push: {
          verificationDocuments: {
            name,
            originalName: req.file.originalname,
            storageName: uploadedAsset.public_id,
            secureUrl: uploadedAsset.secure_url,
            publicId: uploadedAsset.public_id,
            format: uploadedAsset.format || format,
            resourceType,
            mimeType: req.file.mimetype,
            size: req.file.size,
          },
        },
      },
      { new: true, runValidators: true },
    ).select("verificationDocuments technicianStatus rejectionReason");
    if (!technician) {
      await deleteAsset({
        publicId: uploadedAsset.public_id,
        resourceType,
      });
      return sendError(res, "Technician account not found.", 404);
    }
    recordAudit({
      actor: req.user._id,
      action: "TECHNICIAN_DOCUMENT_UPLOADED",
      entityType: "User",
      entityId: req.user._id,
      metadata: { documentName: name },
      ipAddress: req.ip,
    });
    return sendSuccess(res, technician, "Verification document uploaded.", 201);
  } catch (error) {
    if (uploadedAsset?.public_id) {
      try {
        await deleteAsset({
          publicId: uploadedAsset.public_id,
          resourceType: uploadedAsset.resource_type || "raw",
        });
      } catch {
        // The primary database/upload error is more useful to return.
      }
    }
    return sendError(res, error.message || "Unable to upload document.", 503);
  }
};

export const downloadVerificationDocument = async (req, res) => {
  const technician = await User.findOne({
    _id: req.params.id,
    role: "TECHNICIAN",
    "verificationDocuments._id": req.params.documentId,
  }).select("verificationDocuments");
  if (
    !technician ||
    (req.user.role === "TECHNICIAN" &&
      String(req.user._id) !== String(technician._id))
  ) {
    return sendError(res, "Verification document not found.", 404);
  }
  const document = technician.verificationDocuments.id(req.params.documentId);
  if (!document) {
    return sendError(res, "Verification document is unavailable.", 404);
  }
  if (document.publicId && document.secureUrl) {
    try {
      const { buffer, contentType } = await downloadBuffer({
        publicId: document.publicId,
        format: document.format || document.originalName.split(".").pop(),
        resourceType:
          document.resourceType ||
          (document.mimeType === "application/pdf" ? "raw" : "image"),
      });
      res.setHeader("Content-Type", document.mimeType || contentType);
      res.attachment(document.originalName);
      return res.send(buffer);
    } catch (error) {
      return sendError(
        res,
        error.message || "Verification document is unavailable.",
        502,
      );
    }
  }

  if (document.path && fs.existsSync(document.path)) {
    return res.download(document.path, document.originalName);
  }
  return sendError(res, "Verification document is unavailable.", 404);
};

export const updateMyAvailability = async (req, res) => {
  const { availability } = req.body;
  if (!Array.isArray(availability))
    return sendError(res, "Availability must be an array.", 400);
  const valid = availability.every(
    (period) =>
      typeof period.day === "string" &&
      [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ].includes(period.day) &&
      (Boolean(period.off) ||
        (/^([01]\d|2[0-3]):[0-5]\d$/.test(period.startTime) &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test(period.endTime) &&
          period.startTime < period.endTime)),
  );
  if (!valid)
    return sendError(
      res,
      "Each availability period needs a valid day and time range.",
      400,
    );

  const technician = await User.findOneAndUpdate(
    { _id: req.user._id, role: "TECHNICIAN" },
    { availability },
    { new: true, runValidators: true },
  ).select("availability blockedSlots");
  return sendSuccess(res, technician, "Availability updated successfully.");
};

export const addBlockedSlot = async (req, res) => {
  const { date, startTime, endTime } = req.body;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^\d{2}:\d{2}$/.test(startTime) ||
    !/^\d{2}:\d{2}$/.test(endTime) ||
    startTime >= endTime
  ) {
    return sendError(
      res,
      "A valid blocked date and time range are required.",
      400,
    );
  }
  const technician = await User.findOneAndUpdate(
    { _id: req.user._id, role: "TECHNICIAN" },
    { $push: { blockedSlots: { date, startTime, endTime } } },
    { new: true, runValidators: true },
  ).select("availability blockedSlots");
  return sendSuccess(res, technician, "Blocked period added successfully.");
};

export const updateBlockedSlot = async (req, res) => {
  const { date, startTime, endTime } = req.body;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) ||
    startTime >= endTime
  ) {
    return sendError(
      res,
      "A valid blocked date and time range are required.",
      400,
    );
  }
  const technician = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      role: "TECHNICIAN",
      "blockedSlots._id": req.params.slotId,
    },
    {
      $set: {
        "blockedSlots.$.date": date,
        "blockedSlots.$.startTime": startTime,
        "blockedSlots.$.endTime": endTime,
      },
    },
    { new: true, runValidators: true },
  ).select("availability blockedSlots");
  if (!technician) return sendError(res, "Blocked period not found.", 404);
  return sendSuccess(res, technician, "Blocked period updated successfully.");
};

export const deleteBlockedSlot = async (req, res) => {
  const technician = await User.findOneAndUpdate(
    { _id: req.user._id, role: "TECHNICIAN" },
    { $pull: { blockedSlots: { _id: req.params.slotId } } },
    { new: true },
  ).select("availability blockedSlots");
  return sendSuccess(res, technician, "Blocked period removed successfully.");
};
