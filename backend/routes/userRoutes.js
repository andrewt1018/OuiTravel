const express = require("express");
const connectDB = require("../db/mongoose");
const dbo = require("../db/conn");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");

const User = require("../modules/User");
const Notification = require("../modules/Notification");
const Preferences = require("../modules/Preferences");
const Image = require("../modules/Image");
const Location = require("../modules/Location");
const Itinerary = require("../modules/Itinerary");
const CategoryIcon = require("../modules/CategoryIcon");

const router = express.Router();

const verifyToken = (req, res, next) => {
  console.log("Verifying token");
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token provided." });
  }

  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (err) {
      console.log("Verifying token failed");
      return res.status(403).send({ message: "Unauthorized" });
    }
    // if everything good, save to request for use in other routes
    req.user = { id: decoded.id };
    console.log("Token verified successfully");
    next();
  });
};

/* Get user */
/** Used to verify the current user's JWT token (to ensure they're logged in) */
router.get("/get-user", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Check if the user ID passed in is valid or not
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      console.log("User does not exist");
      return res.status(500).send("Invalid user!");
    }
    console.log("Got user:", existingUser.username);
    return res.status(201).send({ user: existingUser });
  } catch (error) {
    return res.status(403).send("Error getting user");
  }
});

/* Save icon */
/** Used to save a marker on the personal map as a persistent icon */
router.post("/save-icon", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { marker } = req.body; // Get the marker where the icon should be saved
  const dbConnect = dbo.getDb();
  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found/invalid." });
    const newIcon = {
      position: {
        lat: marker.position.lat,
        lng: marker.position.lng,
      },
      category: "Other",
      _id: new ObjectId(),
    };
    await dbConnect.collection("users").updateOne(
      { _id: ObjectId.createFromHexString(userId) },
      {
        $push: {
          savedIcons: newIcon,
        },
      }
    );
    return res.status(201).json({ newIcon: newIcon });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Cannot save icon." });
  }
});

// currently hardcoded, will need to fix for location categories later
router.get("/get-category-icon", verifyToken, async (req, res) => {
  const category = "Other";

  try {
    const categoryIcon = await CategoryIcon.findOne({ category });

    if (!categoryIcon) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.status(200).json({
      category: categoryIcon.category,
      char: categoryIcon.char,
      color: categoryIcon.color,
    });
  } catch (error) {
    console.error("Error fetching category icon:", error);
    return res.status(500).json({ message: "Cannot fetch category icon." });
  }
});

router.post("/remove-icon", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { selectedIcon } = req.body;
  console.log("selected icon:", selectedIcon);
  const dbConnect = dbo.getDb();
  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found/invalid." });

    await dbConnect.collection("users").updateOne(
      { _id: ObjectId.createFromHexString(userId) },
      {
        $pull: {
          savedIcons: { _id: ObjectId.createFromHexString(selectedIcon) },
        },
      }
    );
    return res.status(201).json({ message: "Successfully removed icon" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Cannot save icon." });
  }
});

/* Should probably move out of user routes later */
router.post("/update-category-icon", verifyToken, async (req, res) => {
  const { category = "Other", char, color } = req.body;

  try {
    await CategoryIcon.findOneAndUpdate({ category }, { char, color });

    return res
      .status(200)
      .json({ message: "Category icon updated successfully." });
  } catch (error) {
    console.error("Error updating category icon:", error);
    return res.status(500).json({ message: "Cannot update category icon." });
  }
});

/* Add a location to the user's wishlist */
router.post("/post-wishlist", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { placeId } = req.body;
  console.log("Received placeId:", placeId);

  try {
    const location = await Location.findOne({ placeId: placeId });
    if (!location) {
      return res.status(404).json({ message: "Location not found." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.wishlist.includes(location._id)) {
      return res.status(400).json({ message: "Location already wishlisted." });
    }

    user.wishlist.push(location._id);
    await user.save();

    return res
      .status(200)
      .json({
        message: "Location added to wishlist!",
        wishlist: user.wishlist,
      });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/* Remove location from wishlist */
router.delete("/del-wishlist/:placeId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { placeId } = req.params;

  try {
    const location = await Location.findOne({ placeId: placeId });
    if (!location) {
      return res.status(404).json({ message: "Location not found." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.wishlist.includes(location._id)) {
      return res.status(400).json({ message: "Location is not in wishlist." });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== location._id.toString()
    );
    await user.save();

    return res
      .status(200)
      .json({
        message: "Location removed from wishlist!",
        wishlist: user.wishlist,
      });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/* Get wishlist */
router.get("/get-wishlist", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/* Save an itinerary and associate it with the user */
router.post("/save-itinerary", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { itineraryName, location, startDate, endDate, days } = req.body;

  try {
    const processedDays = await Promise.all(
      days.map(async (day) => {
        const activityIds = await Promise.all(
          day.activities.map(async (activity) => {
            const location =
              (await Location.findOne({ name: activity })) ||
              (await Location.findOne({ placeId: activity }));

            return location._id;
          })
        );

        return { date: day.date, activities: activityIds };
      })
    );

    const newItinerary = new Itinerary({
      itineraryName,
      location,
      startDate,
      endDate,
      days: processedDays,
    });

    await newItinerary.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.itineraries.push(newItinerary._id);
    await user.save();

    return res
      .status(201)
      .json({
        message: "Itinerary saved successfully!",
        itinerary: newItinerary,
      });
  } catch (error) {
    console.error("Error saving itinerary:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/* Get user data */
/* Used to verify the current user's JWT token (to ensure they're logged in) */
router.get("/get-userdata", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Check if the user ID passed in is valid or not
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      console.log("User does not exist");
      return res.status(500).send("Invalid user!");
    }
    return res.status(201).send({ message: existingUser });
  } catch (error) {
    return res.status(500).send("Error getting user");
  }
});

/* Edit Profile */
// edit their bio, DoB, profile picture, and other details.
router.post("/edit-profile", verifyToken, async (req, res) => {
  const {
    newEmail,
    newBio,
    newDOB,
    newGender,
    newProfilePic,
    newFirstName,
    newLastName,
  } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found/invalid." });

    if (newFirstName !== undefined && newFirstName !== null)
      user.firstName = newFirstName.trim();
    if (newFirstName !== undefined && newLastName !== null)
      user.lastName = newLastName.trim();
    if (newEmail !== undefined && newEmail !== null)
      user.email = newEmail.trim();
    if (newBio !== undefined && newBio !== null) user.bio = newBio.trim();
    // if (newUsername != undefined && newUsername !== null) user.username = newUsername.trim();
    if (newDOB) user.dob = new Date(newDOB);
    if (newGender && ["Male", "Female", "Other"].includes(newGender)) {
      user.gender = newGender;
    }
    if (newProfilePic) user.profilePic = newProfilePic;
    await user.save();

    return res
      .status(200)
      .json({ message: "User Profile updated successfully " });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Cannot update user profile." });
  }
});

/* Get user preferences to fill the preferences page */
router.get("/getPreferences", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const preferences = await Preferences.findOne({ userId: userId });
    console.log(preferences);

    return res.status(200).json({ preferences });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Cant get user preferences" });
  }
});

/* Edit preferences */
router.post("/preferences", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { activities, activitiesOther, cuisines, travelTypes, destinations } =
    req.body.preferences;
  console.log(activities, activitiesOther, cuisines, travelTypes, destinations);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentPreferences = await Preferences.findOne({ userId: userId });

    let preferences = currentPreferences || new Preferences({ userId });

    preferences.activities = activities || preferences.activities;
    preferences.activitiesOther =
      activitiesOther || preferences.activitiesOther;
    preferences.cuisines = cuisines || preferences.cuisines;
    preferences.travelTypes = travelTypes || preferences.travelTypes;
    preferences.destinations = destinations || preferences.destinations;

    console.log("current preferences: ", preferences);
    await preferences.save();

    user.preferences = preferences;
    await user.save();
    console.log(preferences);

    return res
      .status(200)
      .json({ message: "Preferences updated successfully.", preferences });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating preferences" });
  }
});

//for account privacy setting
router.post("/update-visibility", verifyToken, async (req, res) => {
  console.log("reqbody is ", req.body);
  const { visibility } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found/invalid." });
    user.visibility = visibility;
    await user.save();
    return res
      .status(200)
      .json({ message: "visibility updated successfully " });
  } catch (error) {
    console.log(error);
    console.log("wtf");
    return res.status(500).json({ message: "Cannot update visibility." });
  }
});

router.get("/search-users", async (req, res) => {
  console.log("reqbody is ", req);
  //const { query} = req.query;
  const { query, exclude } = req.query;
  if (!query) return res.json([]);

  try {
    const users = await User.find(
      {
        username: { $regex: `^${query}`, $options: "i", $ne: exclude }, // Exclude logged-in user
      },
      { username: 1, _id: 1 }
    ).limit(10);

    return res.json(users);
  } catch (error) {
    console.error("Error fetching search results:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Follow a user by clicking follow button
router.post("/follow/:userId", verifyToken, async (req, res) => {
  const userId = req.user.id; // Current logged-in user
  const { userId: targetUserId } = req.params; // User to follow

  try {
    if (userId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.visibility === "Private") {
      // Private account: Send a follow request notification
      if (!targetUser.pendingFollowers.includes(userId)) {
        targetUser.pendingFollowers.push(userId);
        user.tryingToFollowList.push(targetUserId);
        await targetUser.save();
        await user.save();

        // Create a follow request notification
        const newNotification = new Notification({
          senderId: userId,
          receiverId: [targetUserId], // Target user receives notification
          type: "Follow Request",
          content: user.username + " wants to follow you.",
          read: false, // Unread by default
          timestamp: new Date(), // Current timestamp
          requestStatus: "NoActionYet",
        });

        await newNotification.save();
        targetUser.notifications.push(newNotification);

        return res.status(200).json({ message: "Follow request sent" });
      } else {
        return res.status(400).json({ message: "Follow request already sent" });
      }
    } else {
      if (!user.followingList.includes(targetUserId)) {
        user.followingList.push(targetUserId);
        targetUser.followerList.push(userId);
        user.followingCount += 1;
        targetUser.followerCount += 1;
        await user.save();
        await targetUser.save();

        // Create a follow request notification
        const newNotification = new Notification({
          senderId: userId,
          receiverId: [targetUserId], // Target user receives notification
          type: "New Follower",
          content: user.username + " followed you ",
          read: false, // Unread by default
          timestamp: new Date(), // Current timestamp by default
        });
        await newNotification.save();
        targetUser.notifications.push(newNotification);
      }
    }

    return res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error following user" });
  }
});

// Unfollow a user
router.post("/unfollow/:userId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { userId: targetUserId } = req.params;
  try {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    user.followingList = user.followingList.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.followerList = targetUser.followerList.filter(
      (id) => id.toString() !== userId
    );
    user.followingCount -= 1;
    targetUser.followerCount -= 1;

    await user.save();
    await targetUser.save();

    return res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error unfollowing user" });
  }
});

// Accept follow request and update followers list for private account
router.post("/acceptFollow/:notificationId", verifyToken, async (req, res) => {
  const { notificationId } = req.params;

  try {
    // Find the notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure it's a follow request
    if (notification.type !== "Follow Request") {
      return res.status(400).json({ message: "Invalid notification type" });
    }

    const receiverId = notification.receiverId[0]; // User who received the follow request
    const senderId = notification.senderId; // User who sent the follow request

    // Find both users
    const receiverUser = await User.findById(receiverId);
    const senderUser = await User.findById(senderId);

    if (!receiverUser || !senderUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (receiverUser.followerList.includes(senderId)) {
      return res.status(400).json({ message: "User is already a follower" });
    }

    // Update followers and following lists and their counts
    receiverUser.followerList.push(senderId);
    senderUser.followingList.push(receiverId);
    receiverUser.followerCount += 1;
    senderUser.followingCount += 1;

    // Remove from pending lists
    receiverUser.pendingFollowers = receiverUser.pendingFollowers.filter(
      (id) => id.toString() !== senderId.toString()
    );
    senderUser.tryingToFollowList = senderUser.tryingToFollowList.filter(
      (id) => id.toString() !== receiverId.toString()
    );

    // Save updates
    await receiverUser.save();
    await senderUser.save();

    return res
      .status(200)
      .json({ message: "Follow request accepted, user followed" });
  } catch (error) {
    console.error("Error accepting follow request:", error);
    return res.status(500).json({ message: "Error processing follow request" });
  }
});

// reject follow request for private account
router.post("/rejectFollow/:notificationId", verifyToken, async (req, res) => {
  const { notificationId } = req.params;

  try {
    // Find the notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure it's a follow request
    if (notification.type !== "Follow Request") {
      return res.status(400).json({ message: "Invalid notification type" });
    }

    const receiverId = notification.receiverId[0]; // User who received the follow request
    const senderId = notification.senderId; // User who sent the follow request

    // Find both users
    const receiverUser = await User.findById(receiverId);
    const senderUser = await User.findById(senderId);

    if (!receiverUser || !senderUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (receiverUser.followerList.includes(senderId)) {
      return res.status(400).json({ message: "User is already a follower" });
    }

    // Remove from pending lists so sender can send request again
    receiverUser.pendingFollowers = receiverUser.pendingFollowers.filter(
      (id) => id.toString() !== senderId.toString()
    );
    senderUser.tryingToFollowList = senderUser.tryingToFollowList.filter(
      (id) => id.toString() !== receiverId.toString()
    );

    // Save updates
    await receiverUser.save();
    await senderUser.save();

    return res
      .status(200)
      .json({ message: "Follow request accepted, user followed" });
  } catch (error) {
    console.error("Error accepting follow request:", error);
    return res.status(500).json({ message: "Error processing follow request" });
  }
});

// Update profile pic
router.put("/profile-pic", verifyToken, async (req, res) => {
  try {
    const { imageId } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: imageId },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile picture updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    res.json(user); // Send back the user data
  } catch (err) {
    res.status(500).send("Error fetching user data");
  }
});

module.exports = router;
