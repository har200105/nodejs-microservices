const express = require("express");
const router = express.Router();
const {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  addFavouriteContact,
  removeFavouriteContact,
  appEvents,
} = require("../controllers/contactController");
const authorizeUser = require("../middlewares/authorizeMiddleware");

router.use("/app-events", appEvents);
router.put("/favourite",authorizeUser,addFavouriteContact);
router.delete("/favourite/:id",authorizeUser,removeFavouriteContact);
router.route("/").get(authorizeUser,getContacts).post(authorizeUser,createContact);
router.route("/:id").get(authorizeUser,getContact).put(authorizeUser,updateContact).delete(authorizeUser,deleteContact);

module.exports = router;


