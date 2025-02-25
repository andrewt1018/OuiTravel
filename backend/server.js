const express = require("express");
const dbo = require("./db/conn");
const cors = require("cors");
// const corsOptions = {
//   origin: "http://localhost:3000", // Explicitly allow frontend origin
//   credentials: true, // Allow cookies & authentication headers
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
// };

// Specify all of the backend routes for the server
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const profileRoutes = require("./routes/profileRoutes"); //profile route for other users' profiles

const router = express.Router();
const app = express();
// const { app, server } = require("./lib/socket.js");
require("dotenv").config({ path: "./config.env" });

const PORT = process.env.PORT;
// Middleware
app.use(cors());
app.use(express.json());
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", uploadRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/profile", profileRoutes); //profile route

app.listen(PORT, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = router;
