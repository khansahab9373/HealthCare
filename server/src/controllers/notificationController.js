import Notification from "../models/Notification.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      readAt: null,
    });
    return sendSuccess(
      res,
      { notifications, unreadCount },
      "Notifications fetched successfully.",
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to fetch notifications.",
      500,
    );
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { readAt: new Date() },
      { new: true },
    );
    if (!notification) return sendError(res, "Notification not found.", 404);
    return sendSuccess(res, notification, "Notification marked as read.");
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to update notification.",
      500,
    );
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, readAt: null },
      { readAt: new Date() },
    );
    return sendSuccess(res, null, "All notifications marked as read.");
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to update notifications.",
      500,
    );
  }
};
