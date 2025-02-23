const express = require("express");
const router = express.Router();
const dbo = require("../db/conn");

// GET user profile by username
router.get("/:username", async (req, res) => {
  const dbConnect = dbo.getDb();
  const { username } = req.params;

  try {
    const user = await dbConnect.collection("users").findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
