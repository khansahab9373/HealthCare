import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    tests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    }],
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    slotKey: {
      type: String,
      required: true,
      unique: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    collectionType: {
      type: String,
      enum: ["HOME_COLLECTION", "LAB_VISIT"],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      instructions: String,
    },
    status: {
      type: String,
      enum: [
        "REQUESTED",
        "CONFIRMED",
        "TECHNICIAN_ASSIGNED",
        "SAMPLE_COLLECTED",
        "SAMPLE_RECEIVED",
        "TESTING",
        "REPORT_SUBMITTED",
        "REPORT_APPROVED",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        "NO_SHOW",
      ],
      default: "REQUESTED",
    },
    sampleStatus: {
      type: String,
      enum: [
        "PENDING_COLLECTION",
        "COLLECTED",
        "RECEIVED",
        "IN_TESTING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING_COLLECTION",
    },
    sampleId: { type: String, unique: true, sparse: true },
    sampleStatusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        note: { type: String, default: "" },
      },
    ],
    reportStatus: {
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
    notes: {
      type: String,
      default: "",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

appointmentSchema.index({ patient: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ technician: 1, appointmentDate: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
