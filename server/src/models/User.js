import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["PATIENT", "TECHNICIAN", "ADMIN"],
      default: "PATIENT",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    qualification: String,
    experience: String,
    professionalSkills: [String],
    technicianStatus: {
      type: String,
      enum: ["PENDING_VERIFICATION", "VERIFIED", "REJECTED", "SUSPENDED"],
      default: "PENDING_VERIFICATION",
    },
    rejectionReason: { type: String, default: "" },
    verificationDocuments: [
      {
        name: { type: String, required: true, trim: true },
        originalName: { type: String, required: true },
        storageName: { type: String, required: true },
        path: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    qualifiedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }],
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
        off: { type: Boolean, default: false },
      },
    ],
    blockedSlots: [
      {
        date: String,
        startTime: String,
        endTime: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
