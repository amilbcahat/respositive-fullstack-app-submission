const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name"],
  },
  phone: {
    type: String,
    required: [true, "Please enter a phone number"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email address"],
  },
  hobbies: {
    type: [String],
    required: [true, "Please enter your hobbies"],
  },
});

const Table = mongoose.model("table", tableSchema);
module.exports = Table;
