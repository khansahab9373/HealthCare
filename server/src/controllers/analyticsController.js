import Appointment from "../models/Appointment.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const getAdminAnalytics = async (req, res) => {
  try {
    const [
      appointmentsByDay,
      testPopularity,
      statusDistribution,
      technicianWorkload,
      completedTests,
      cancellationStats,
    ] = await Promise.all([
      Appointment.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Appointment.aggregate([
        {
          $set: {
            selectedTests: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ["$tests", []] } }, 0] },
                "$tests",
                ["$test"],
              ],
            },
          },
        },
        { $unwind: "$selectedTests" },
        { $group: { _id: "$selectedTests", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "tests",
            localField: "_id",
            foreignField: "_id",
            as: "test",
          },
        },
        { $unwind: "$test" },
        { $project: { _id: 0, test: "$test.name", count: 1 } },
      ]),
      Appointment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Appointment.aggregate([
        { $match: { technician: { $ne: null } } },
        {
          $group: {
            _id: "$technician",
            count: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "technician",
          },
        },
        { $unwind: "$technician" },
        {
          $project: {
            _id: 0,
            technician: "$technician.name",
            count: 1,
            completed: 1,
          },
        },
        { $sort: { count: -1 } },
      ]),
      Appointment.countDocuments({ status: "COMPLETED" }),
      Appointment.aggregate([
        { $match: { status: { $in: ["CANCELLED", "NO_SHOW"] } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    return sendSuccess(
      res,
      {
        appointmentsByDay,
        testPopularity,
        statusDistribution,
        technicianWorkload,
        completedTests,
        cancellationStats,
      },
      "Admin analytics fetched successfully.",
    );
  } catch (error) {
    return sendError(res, error.message || "Unable to fetch analytics.", 500);
  }
};
