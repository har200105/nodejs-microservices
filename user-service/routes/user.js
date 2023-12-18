const express = require("express");
const {
  registerUser,
  currentUser,
  loginUser,
  userProfile,
  userFavourite,
  appEvents,
} = require("../controllers/userController");
const authorizeUser = require("../middlewares/authorizeMiddleware");

const router = express.Router();

router.use("/app-events", appEvents);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authorizeUser, userProfile);
router.get("/favourite", authorizeUser, userFavourite);
router.get("/current", authorizeUser, currentUser);

module.exports = router;
