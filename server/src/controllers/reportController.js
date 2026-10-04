import Appointment from "../models/Appointment.js";
import Report from "../models/Report.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { createNotification } from "../services/notificationService.js";
import PDFDocument from "pdfkit";
import { recordAudit } from "../services/auditService.js";
import mongoose from "mongoose";

export const submitReport = async (req, res) => {
  try {
    const { results, interpretation } = req.body;
    if (!Array.isArray(results) || results.length === 0) {
      return sendError(res, "At least one test result is required.", 400);
    }

    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      technician: req.user._id,
    }).populate("test", "name code");

    if (!appointment) {
      return sendError(
        res,
        "Appointment not found or not assigned to you.",
        404,
      );
    }

    if (appointment.status !== "TESTING") {
      return sendError(
        res,
        "Report submission is only available while the appointment is in testing.",
        400,
      );
    }

    const existingReport = await Report.findOne({
      appointment: req.params.appointmentId,
    });
    if (
      existingReport &&
      !["DRAFT", "REJECTED", "CORRECTION_REQUESTED"].includes(
        existingReport.status,
      )
    ) {
      return sendError(res, "This report is no longer editable.", 400);
    }

    const report = await Report.findOneAndUpdate(
      { appointment: appointment._id },
      {
        appointment: appointment._id,
        patient: appointment.patient,
        technician: req.user._id,
        test: appointment.test._id,
        results,
        interpretation: interpretation || "",
        remarks: req.body.remarks || "",
        status: "SUBMITTED",
        submittedAt: new Date(),
        reviewedAt: undefined,
        publishedAt: undefined,
        approvedAt: undefined,
        rejectionReason: "",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    )
      .populate("test", "name code")
      .populate("technician", "name");

    appointment.status = "REPORT_SUBMITTED";
    appointment.reportStatus = "SUBMITTED";
    appointment.statusHistory.push({
      status: "REPORT_SUBMITTED",
      changedBy: req.user._id,
    });
    await appointment.save();
    await createNotification({
      recipient: appointment.patient,
      type: "REPORT_SUBMITTED",
      title: "Report submitted",
      message: "Your report is ready for administrative review.",
      metadata: { appointmentId: appointment._id },
    });
    await recordAudit({
      actor: req.user._id,
      action: "REPORT_SUBMITTED",
      entityType: "Report",
      entityId: report._id,
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      report,
      "Report submitted for admin approval.",
      201,
    );
  } catch (error) {
    return sendError(res, error.message || "Unable to submit report.", 500);
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({
      patient: req.user._id,
      status: { $in: ["APPROVED", "PUBLISHED"] },
    })
      .populate("test", "name code")
      .populate("appointment", "appointmentDate sampleId")
      .populate("technician", "name")
      .sort({ createdAt: -1 });

    return sendSuccess(res, reports, "Patient reports fetched successfully.");
  } catch (error) {
    return sendError(res, error.message || "Unable to fetch reports.", 500);
  }
};

export const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("patient", "name email phone")
      .populate("technician", "name email phone")
      .populate("approvedBy", "name email")
      .populate("test", "name code")
      .populate("appointment", "appointmentDate startTime sampleId")
      .sort({ createdAt: -1 });

    return sendSuccess(res, reports, "Admin reports fetched successfully.");
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to fetch admin reports.",
      500,
    );
  }
};

export const approveReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      status: { $in: ["SUBMITTED", "UNDER_REVIEW"] },
    });
    if (!report) {
      return sendError(res, "Only a submitted report can be approved.", 400);
    }

    const appointment = await Appointment.findOne({
      _id: report.appointment,
      status: "REPORT_SUBMITTED",
      reportStatus: { $in: ["SUBMITTED", "UNDER_REVIEW"] },
    });
    if (!appointment) {
      return sendError(
        res,
        "The report is not attached to an appointment awaiting approval.",
        400,
      );
    }

    report.status = "APPROVED";
    report.approvedAt = new Date();
    report.reviewedAt = new Date();
    report.approvedBy = req.user._id;
    appointment.status = "REPORT_APPROVED";
    appointment.reportStatus = "APPROVED";
    appointment.statusHistory.push({
      status: "REPORT_APPROVED",
      changedBy: req.user._id,
    });
    await report.save();
    await appointment.save();
    await createNotification({
      recipient: report.patient,
      type: "REPORT_APPROVED",
      title: "Report approved",
      message: "Your approved report is now available in the patient portal.",
      metadata: { reportId: report._id },
    });
    await recordAudit({
      actor: req.user._id,
      action: "REPORT_APPROVED",
      entityType: "Report",
      entityId: report._id,
      ipAddress: req.ip,
    });

    const populatedReport = await Report.findById(report._id)
      .populate("patient", "name email phone")
      .populate("technician", "name email phone")
      .populate("approvedBy", "name email")
      .populate("test", "name code")
      .populate("appointment", "appointmentDate startTime");

    return sendSuccess(res, populatedReport, "Report approved successfully.");
  } catch (error) {
    return sendError(res, error.message || "Unable to approve report.", 500);
  }
};

const reviewReport = async (req, res, nextStatus) => {
  try {
    const reason = String(req.body.reason || "").trim();
    if (["REJECTED", "CORRECTION_REQUESTED"].includes(nextStatus) && !reason) {
      return sendError(
        res,
        "A reason is required for this review action.",
        400,
      );
    }
    const existingReport = await Report.findOne({
      _id: req.params.id,
      status: { $in: ["SUBMITTED", "UNDER_REVIEW"] },
    });
    if (!existingReport)
      return sendError(res, "Only a submitted report can be reviewed.", 400);
    const appointment = await Appointment.findById(existingReport.appointment);
    if (!appointment)
      return sendError(res, "Report appointment not found.", 404);
    const report = await Report.findOneAndUpdate(
      { _id: existingReport._id, status: { $in: ["SUBMITTED", "UNDER_REVIEW"] } },
      { status: nextStatus, rejectionReason: reason, reviewedAt: new Date() },
      { new: true, runValidators: true },
    );
    if (!report)
      return sendError(res, "Only a submitted report can be reviewed.", 400);
    const appointmentStatus =
      nextStatus === "CORRECTION_REQUESTED" || nextStatus === "REJECTED"
        ? "TESTING"
        : "REPORT_SUBMITTED";
    appointment.reportStatus = nextStatus;
    if (appointment.status !== appointmentStatus) {
      appointment.status = appointmentStatus;
      appointment.statusHistory.push({
        status: appointmentStatus,
        changedBy: req.user._id,
        note: reason,
      });
    }
    await appointment.save();
    await createNotification({
      recipient: report.technician,
      type: `REPORT_${nextStatus}`,
      title: `Report ${nextStatus.replaceAll("_", " ").toLowerCase()}`,
      message: reason || "Your report review status has been updated.",
      metadata: { reportId: report._id },
    });
    await recordAudit({
      actor: req.user._id,
      action: `REPORT_${nextStatus}`,
      entityType: "Report",
      entityId: report._id,
      metadata: { reason },
      ipAddress: req.ip,
    });
    return sendSuccess(
      res,
      report,
      `Report marked ${nextStatus.toLowerCase()}.`,
    );
  } catch (error) {
    return sendError(res, error.message || "Unable to review report.", 500);
  }
};

export const markReportUnderReview = (req, res) =>
  reviewReport(req, res, "UNDER_REVIEW");
export const rejectReport = (req, res) => reviewReport(req, res, "REJECTED");
export const requestReportCorrection = (req, res) =>
  reviewReport(req, res, "CORRECTION_REQUESTED");

export const publishReport = async (req, res) => {
  try {
    const existingReport = await Report.findOne({
      _id: req.params.id,
      status: "APPROVED",
    });
    if (!existingReport)
      return sendError(res, "Only an approved report can be published.", 400);
    const appointment = await Appointment.findOne({
      _id: existingReport.appointment,
      status: "REPORT_APPROVED",
      reportStatus: "APPROVED",
    });
    if (!appointment)
      return sendError(
        res,
        "The approved report is not ready for publication.",
        400,
      );
    const report = await Report.findOneAndUpdate(
      { _id: existingReport._id, status: "APPROVED" },
      { status: "PUBLISHED", publishedAt: new Date() },
      { new: true, runValidators: true },
    );
    if (!report)
      return sendError(res, "Only an approved report can be published.", 400);
    appointment.status = "COMPLETED";
    appointment.reportStatus = "PUBLISHED";
    appointment.sampleStatus = "COMPLETED";
    appointment.sampleStatusHistory.push({
      status: "COMPLETED",
      changedBy: req.user._id,
      note: "Report published",
    });
    appointment.statusHistory.push({
      status: "COMPLETED",
      changedBy: req.user._id,
    });
    await appointment.save();
    await createNotification({
      recipient: report.patient,
      type: "REPORT_PUBLISHED",
      title: "Report published",
      message: "Your report is now available in the patient portal.",
      metadata: { reportId: report._id },
    });
    await recordAudit({
      actor: req.user._id,
      action: "REPORT_PUBLISHED",
      entityType: "Report",
      entityId: report._id,
      ipAddress: req.ip,
    });
    await recordAudit({
      actor: req.user._id,
      action: "SAMPLE_COMPLETED",
      entityType: "Appointment",
      entityId: appointment._id,
      ipAddress: req.ip,
    });
    return sendSuccess(res, report, "Report published successfully.");
  } catch (error) {
    return sendError(res, error.message || "Unable to publish report.", 500);
  }
};

export const downloadReport = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, "Approved report not found.", 404);
    }
    const report = await Report.findOne({
      _id: req.params.id,
      status: { $in: ["APPROVED", "PUBLISHED"] },
    })
      .populate("patient", "name email")
      .populate("test", "name code")
      .populate("technician", "name")
      .populate("approvedBy", "name")
      .populate("appointment", "sampleId");

    if (
      !report ||
      (req.user.role === "PATIENT" &&
        String(report.patient._id) !== String(req.user._id))
    ) {
      return sendError(res, "Approved report not found.", 404);
    }

    const document = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bloodcare-report-${report.test.code}.pdf"`,
    );
    document.pipe(res);
    document
      .fontSize(22)
      .fillColor("#0d5c63")
      .text("BloodCare", { continued: false });
    document
      .moveDown()
      .fontSize(16)
      .fillColor("#123b40")
      .text("Diagnostic Report");
    document
      .moveDown()
      .fontSize(10)
      .fillColor("#555")
      .text(`Report ID: ${report._id}`)
      .text(`Approval status: ${report.status}`)
      .text(
        `Approved by: ${report.approvedBy?.name || "BloodCare administrator"}`,
      );
    document
      .moveDown()
      .fontSize(11)
      .fillColor("#333")
      .text(`Patient: ${report.patient.name}`);
    document.text(`Test: ${report.test.name} (${report.test.code})`);
    document.text(`Technician: ${report.technician.name}`);
    document.text(
      `Sample ID: ${report.appointment?.sampleId || "Not available"}`,
    );
    document.text(`Report date: ${report.createdAt.toLocaleDateString()}`);
    document.text(
      `Approved: ${report.approvedAt?.toLocaleDateString() || "Approved"}`,
    );
    document.moveDown();
    report.results.forEach((result) => {
      document.text(
        `${result.marker}: ${result.value} ${result.unit || ""} | ${result.flag} | Reference: ${result.referenceRange || "N/A"} | Remarks: ${result.remarks || "N/A"}`,
      );
    });
    document.moveDown().text(`Interpretation: ${report.interpretation}`);
    if (report.remarks) document.text(`Remarks: ${report.remarks}`);
    document.end();
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to generate report PDF.",
      500,
    );
  }
};
