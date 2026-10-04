import Notification from "../models/Notification.js";

export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  metadata = {},
}) => Notification.create({ recipient, type, title, message, metadata });

export const createNotifications = async (notifications) => {
  if (notifications.length === 0) return [];
  return Notification.insertMany(notifications);
};
