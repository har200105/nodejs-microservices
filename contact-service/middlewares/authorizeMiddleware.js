const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const authorizeUser = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  console.log(authHeader);
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
      if (err) {
        console.log("err", err);
        res.status(401);
        throw new Error("User is not authorized");
      }
      console.log("decoded", decoded);
      req.user = decoded.user;
      next();
    });

    if (!token) {
      res.status(401);
      throw new Error("User is not authorized or token is missing");
    }
  }
});

module.exports = authorizeUser;

