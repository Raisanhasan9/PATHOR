const Notification = require("../models/Notification");
const User = require("../models/User");

// Send push notification via FCM
const sendPushNotification = async ({ fcmToken, title, body, data = {} }) => {
  try {
    const { getFirebaseMessaging } = require("../config/firebase");
    const messaging = getFirebaseMessaging();

    const message = {
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)]),
      ),
      android: {
        priority: "high",
        notification: { sound: "default" },
      },
      apns: {
        payload: { aps: { sound: "default" } },
      },
    };

    const response = await messaging.send(message);
    return response;
  } catch (error) {
    // Don't crash if push fails — just log it
    console.error("FCM push error:", error.message);
    return null;
  }
};

// Create DB notification + optionally send FCM push
const sendNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
}) => {
  try {
    // Save to DB
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
    });

    // Get user's FCM token and send push
    const user = await User.findById(userId).select("fcmToken");
    if (user?.fcmToken) {
      await sendPushNotification({
        fcmToken: user.fcmToken,
        title,
        body: message,
        data: { ...data, notificationId: notification._id.toString() },
      });
    }

    return notification;
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

// Send push to multiple users at once
const sendBulkNotification = async ({
  userIds,
  type,
  title,
  message,
  data = {},
}) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      fcmToken: { $exists: true, $ne: null },
    }).select("_id fcmToken");

    // Save all to DB
    const notifications = userIds.map((userId) => ({
      user: userId,
      type,
      title,
      message,
      data,
    }));
    await Notification.insertMany(notifications);

    // Send FCM to each
    const pushPromises = users.map((u) =>
      sendPushNotification({
        fcmToken: u.fcmToken,
        title,
        body: message,
        data,
      }),
    );
    await Promise.allSettled(pushPromises);
  } catch (error) {
    console.error("Bulk notification error:", error.message);
  }
};

module.exports = {
  sendNotification,
  sendBulkNotification,
  sendPushNotification,
};
