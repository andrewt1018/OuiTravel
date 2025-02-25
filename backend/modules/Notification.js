const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  type: {
    type: String,
    enum: [
      "Follow Request",
      "New Message",
      "New Review",
      "New Journal",
      "Post Liked",
      "Post Commented",
      "End-of-day Reminder",
      "Upcoming Trip",
      "Achievement Unlocked",
      "Tagged",
      "Recommended Location",
    ],
    required: true,
  },
  followrequest: {
    type: String,
    enum: ["Public", "Private"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
