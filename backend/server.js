const express = require("express");
const cors = require("cors");

const app = express();
require("dotenv").config({ path: "./config.env" });

const PORT = process.env.PORT;
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
