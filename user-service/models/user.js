const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the user name"],
    },
    email: {
      type: String,
      required: [true, "Please add the user email address"],
      unique: [true, "Email address already taken"],
    },
    password: {
      type: String,
      required: [true, "Please add the user password"],
    },
    contact: [
      {
        _id: { type: String, require: true },
        name: { type: String, require: true },
      },
    ],
    favourite: [
      {
        _id: { type: String, require: true },
        name: { type: String, require: true },
        email: { type: String, require: true },
        phone: { type: String, require: true },
        date: { type: Date, default: Date.now() },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
