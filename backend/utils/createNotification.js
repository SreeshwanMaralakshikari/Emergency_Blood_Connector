import { NotificationModel }
from "../models/NotificationModel.js";

export const createNotification =
  async (
    userId,
    title,
    message,
    type = "GENERAL"
  ) => {
    await NotificationModel.create({
      userId,
      title,
      message,
      type,
    });
  };