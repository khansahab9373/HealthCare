import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
      },
    ],
    results: [
      {
        marker: { type: String, required: true, trim: true },
        value: { type: String, required: true, trim: true },
        unit: { type: String, default: "" },
        referenceRange: { type: String, default: "" },
        remarks: { type: String, default: "" },
        flag: {
          type: String,
          enum: ["NORMAL", "LOW", "HIGH", "CRITICAL"],
          default: "NORMAL",
        },
      },
    ],
    interpretation: { type: String, default: "" },
    remarks: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    submittedAt: Date,
    reviewedAt: Date,
    publishedAt: Date,
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "UNDER_REVIEW",
        "REJECTED",
        "CORRECTION_REQUESTED",
        "APPROVED",
        "PUBLISHED",
      ],
      default: "DRAFT",
    },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pdfSecureUrl: String,
    pdfPublicId: String,
    pdfFormat: String,
    pdfResourceType: String,
  },
  { timestamps: true },
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
