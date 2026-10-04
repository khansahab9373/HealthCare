import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Test from "../models/Test.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { recordAudit } from "../services/auditService.js";

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: "7d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = "PATIENT",
      qualification,
      experience,
      professionalSkills,
      qualifiedTests,
    } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required.", 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, "User with this email already exists.", 409);
    }

    if (!["PATIENT", "TECHNICIAN"].includes(role)) {
      return sendError(
        res,
        "Public registration is limited to patients and technicians.",
        400,
      );
    }

    const validQualifiedTests =
      role === "TECHNICIAN" && Array.isArray(qualifiedTests)
        ? await Test.find({
            _id: { $in: qualifiedTests },
            active: true,
          }).distinct("_id")
        : [];
    if (
      role === "TECHNICIAN" &&
      Array.isArray(qualifiedTests) &&
      validQualifiedTests.length !== new Set(qualifiedTests.map(String)).size
    ) {
      return sendError(res, "Qualified tests must be active tests.", 400);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || "",
      address: req.body.address || {},
      role,
      ...(role === "TECHNICIAN" && {
        qualification: qualification || "",
        experience: experience || "",
        professionalSkills: Array.isArray(professionalSkills)
          ? professionalSkills
          : [],
        qualifiedTests: validQualifiedTests,
        technicianStatus: "PENDING_VERIFICATION",
      }),
    });

    const token = generateToken(user);
    recordAudit({
      actor: user._id,
      action: "REGISTERED",
      entityType: "User",
      entityId: user._id,
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          technicianStatus: user.technicianStatus,
          rejectionReason: user.rejectionReason,
          qualification: user.qualification,
          experience: user.experience,
          professionalSkills: user.professionalSkills,
          qualifiedTests: user.qualifiedTests,
          verificationDocuments: user.verificationDocuments,
        },
      },
      "Registration successful.",
      201,
    );
  } catch (error) {
    return sendError(res, error.message || "Registration failed.", 500);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required.", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, "Invalid email or password.", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch || user.isActive === false) {
      return sendError(res, "Invalid email or password.", 401);
    }

    const token = generateToken(user);
    recordAudit({
      actor: user._id,
      action: "LOGIN",
      entityType: "User",
      entityId: user._id,
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          technicianStatus: user.technicianStatus,
          rejectionReason: user.rejectionReason,
          qualification: user.qualification,
          experience: user.experience,
          professionalSkills: user.professionalSkills,
          qualifiedTests: user.qualifiedTests,
          verificationDocuments: user.verificationDocuments,
        },
      },
      "Login successful.",
    );
  } catch (error) {
    return sendError(res, error.message || "Login failed.", 500);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    return sendSuccess(res, {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      address: req.user.address,
      technicianStatus: req.user.technicianStatus,
      rejectionReason: req.user.rejectionReason,
      qualification: req.user.qualification,
      experience: req.user.experience,
      professionalSkills: req.user.professionalSkills,
      qualifiedTests: req.user.qualifiedTests,
      verificationDocuments: req.user.verificationDocuments,
    });
  } catch (error) {
    return sendError(res, error.message || "Unable to fetch user.", 500);
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      qualification,
      experience,
      professionalSkills,
    } = req.body;

    if (!name?.trim()) {
      return sendError(res, "Name is required.", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name.trim(),
        phone: phone?.trim() || "",
        address: address || {},
        ...(req.user.role === "TECHNICIAN" && {
          qualification: qualification?.trim() || "",
          experience: experience?.trim() || "",
          professionalSkills: Array.isArray(professionalSkills)
            ? professionalSkills.filter(Boolean)
            : [],
        }),
      },
      { new: true, runValidators: true },
    ).select("-password");

    return sendSuccess(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        technicianStatus: user.technicianStatus,
        rejectionReason: user.rejectionReason,
        qualification: user.qualification,
        experience: user.experience,
        professionalSkills: user.professionalSkills,
        qualifiedTests: user.qualifiedTests,
        verificationDocuments: user.verificationDocuments,
      },
      "Profile updated successfully.",
    );
  } catch (error) {
    return sendError(res, error.message || "Unable to update profile.", 500);
  }
};
