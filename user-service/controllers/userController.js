const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const { APP_SECRET } = require("../config");


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const userAvailable = await UserModel.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered!");
  }


  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password: ", hashedPassword);
  const user = await UserModel.create({
    username,
    email,
    password: hashedPassword,
  });

  console.log(`User created ${user}`);
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data us not valid");
  }
  res.json({ message: "Register the user" });
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("The email and password is :", email);
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const user = await UserModel.findOne({ email });
  console.log("The user is: ", user);
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      APP_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("email or password is not valid");
  }
});


const userProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const userProfile = await UserModel.findById(id);
  if (!userProfile) {
    res.status(400);
    throw new Error("User not found");
  }
  res.status(200).json(userProfile);
});


const userFavourite = asyncHandler(async (req, res) => {
  const { id } = req.user;
  console.log("The user ID is :", id);
  const userProfile = await UserModel.findById(id).populate("favourite");
  console.log("The user profile is : ", userProfile);
  if (!userProfile) {
    res.status(400);
    throw new Error("User not found");
  }
  res.status(200).json(userProfile.favourite);
});


const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const manageFavourite = async (event, { userId, _id, name, email, phone }) => {
  const contact = { _id, name, email, phone };
  const userProfile = await UserModel.findById(userId).populate("favourite");
  if (userProfile) {
    let favourite = userProfile.favourite;
    if (favourite.length > 0) {
      let isPresent = false;
      favourite.map((item) => {
        if (
          item._id.toString() === contact._id.toString() &&
          event === "REMOVE_FROM_FAVOURITE"
        ) {
          favourite.splice(favourite.indexOf(item), 1);
          isPresent = true;
        } else {
          isPresent = true;
        }
      });
      if (!isPresent) {
        favourite.push(contact);
      }
    } else {
      favourite.push(contact);
    }
    userProfile.favourite = favourite;
  }
  await userProfile.save();
};

const appEvents = asyncHandler(async (req, res, next) => {
  const { payload } = req.body;
  console.log("===User Service Received Event=== : ", payload);
  subscribeEvents(payload);
  res.status(200).json(payload);
});

const manageContact = async (event, { userId, _id, name, email, phone }) => {
    
  const contact = { _id, name };
  const userProfile = await UserModel.findById(userId).populate("contact");
  if (userProfile) {
    let contactList = userProfile.contact;
    if (event === "ADD_CONTACT") {
      contactList.push(contact);
    } else {
      console.log("THe contactList is : ", contactList);
      let index = contactList.findIndex(
        (item) => item._id.toString() === contact._id.toString()
      );
      console.log("The index is : ", index);
      if (event === "UPDATE_CONTACT") {
        console.log("The current value is : ", contactList[index]);
        contactList[index] = contact;
      }
      if (event === "DELETE_CONTACT") {
        contactList.splice(index, 1);
      }
    }
    userProfile.contact = contactList;
    await userProfile.save();
  }
};

const subscribeEvents = async (payload) => {
  console.log("User Subscribe Event Triggered");
  const { event, contact } = payload;
  switch (event) {
    case "ADD_TO_FAVOURITE":
    case "REMOVE_FROM_FAVOURITE":
      manageFavourite(event, contact);
      break;
    case "ADD_CONTACT":
    case "UPDATE_CONTACT":
    case "DELETE_CONTACT":
      manageContact(event, contact);
      break;
    default:
      break;
  }
};
module.exports = {
  registerUser,
  loginUser,
  currentUser,
  userProfile,
  userFavourite,
  appEvents,
  subscribeEvents,
};
