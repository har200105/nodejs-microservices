const asyncHandler = require("express-async-handler");
const axios = require("axios");
const ContactModel = require("../models/contact");
const { publishMessage } = require("../utils/queue");


const getContacts = asyncHandler(async (req, res) => {
  console.log("The contacts request is : ", req.user);
  const contacts = await ContactModel.find({ userId: req.user.id });
  res.status(200).json(contacts);
});


const createContact = asyncHandler(async (req, res) => {
  console.log("The request body is :", req.body);
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields are mandatory !");
  }
  const contact = await ContactModel.create({
    name,
    email,
    phone,
    userId: req.user.id,
  });

  const payload = {
    event: "ADD_CONTACT",
    contact,
  };

  publishMessage(JSON.stringify(payload));
  res.status(201).json(contact);
});


const getContact = asyncHandler(async (req, res) => {
  const contact = await ContactModel.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  res.status(200).json(contact);
});

const updateContact = asyncHandler(async (req, res) => {
  const contact = await ContactModel.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  if (contact.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User don't have permission to update other user contacts");
  }
  const updatedContact = await ContactModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  console.log("The updated contact is :", updateContact);
  const payload = {
    event: "UPDATE_CONTACT",
    contact: updatedContact,
  };
  publishUserEvent(payload);

  res.status(200).json(updatedContact);
});


const deleteContact = asyncHandler(async (req, res) => {
  const contact = await ContactModel.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  if (contact.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User don't have permission to update other user contacts");
  }
  await ContactModel.deleteOne({ _id: req.params.id });
  const payload = {
    event: "DELETE_CONTACT",
    contact,
  };
  publishUserEvent(payload);
  res.status(200).json(contact);
});


const addFavouriteContact = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const contact = await ContactModel.findById(req.body.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  console.log("The contact exisit for adding to favourite : ", contact);
  const payload = {
    event: "ADD_TO_FAVOURITE",
    contact,
  };
  console.log("the payload is : ", payload);
  publishUserEvent(payload);
  res.status(200).json(contact);
});


const removeFavouriteContact = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const contact = await ContactModel.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  const payload = {
    event: "REMOVE_FROM_FAVOURITE",
    contact,
  };

  publishUserEvent(payload);
  res.status(200).json(contact);
});


const appEvents = asyncHandler(async (req, res, next) => {
  const { payload } = req.body;
  console.log("===Contact Service Received Event===");
  res.status(200).json(payload);
});

const publishUserEvent = async (payload) => {
  axios.post("http://localhost:8000/api/user/app-events", { payload });
};

module.exports = {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  addFavouriteContact,
  removeFavouriteContact,
  appEvents,
};
