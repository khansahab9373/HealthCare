import Test from "../models/Test.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { recordAudit } from "../services/auditService.js";

export const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({ active: true }).sort({ name: 1 });
    return sendSuccess(res, tests, "Tests retrieved successfully.");
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch tests.", 500);
  }
};

export const getAdminTests = async (req, res) => {
  try {
    const tests = await Test.find().sort({ name: 1 });
    return sendSuccess(res, tests, "Test catalog fetched successfully.");
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to fetch test catalog.",
      500,
    );
  }
};

export const createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    recordAudit({
      actor: req.user._id,
      action: "TEST_CREATED",
      entityType: "Test",
      entityId: test._id,
      ipAddress: req.ip,
    });
    return sendSuccess(res, test, "Test created successfully.", 201);
  } catch (error) {
    return sendError(res, error.message || "Unable to create test.", 500);
  }
};

export const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return sendError(res, "Test not found.", 404);
    }
    return sendSuccess(res, test, "Test details retrieved successfully.");
  } catch (error) {
    return sendError(res, error.message || "Unable to fetch test.", 500);
  }
};

export const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!test) return sendError(res, "Test not found.", 404);
    recordAudit({
      actor: req.user._id,
      action: "TEST_UPDATED",
      entityType: "Test",
      entityId: test._id,
      ipAddress: req.ip,
    });
    return sendSuccess(res, test, "Test updated successfully.");
  } catch (error) {
    return sendError(
      res,
      error.code === 11000
        ? "A test with this code already exists."
        : error.message || "Unable to update test.",
      error.code === 11000 ? 409 : 500,
    );
  }
};

export const updateTestStatus = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { active: req.body.active },
      { new: true, runValidators: true },
    );
    if (!test) return sendError(res, "Test not found.", 404);
    recordAudit({
      actor: req.user._id,
      action: req.body.active ? "TEST_ACTIVATED" : "TEST_DEACTIVATED",
      entityType: "Test",
      entityId: test._id,
      ipAddress: req.ip,
    });
    return sendSuccess(
      res,
      test,
      `Test ${req.body.active ? "activated" : "deactivated"} successfully.`,
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to update test status.",
      500,
    );
  }
};
