const mongoose = require("mongoose");

const categoryIconSchema = new mongoose.Schema({
  category: {
    type: String,
    default: "Other",
  },
  char: {
    type: String,
    default: "BakeryDining",
  },
  color: {
    type: String,
    default: "pink",
  }
});

const CategoryIcon = mongoose.model("CategoryIcon", categoryIconSchema);

module.exports = CategoryIcon;
