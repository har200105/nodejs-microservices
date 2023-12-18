const express = require("express");
const connectDb  = require("./db/database");
const errorHandler  = require("./middlewares/errorHandler");
const { PORT } = require("./config");
const userRoutes = require("./routes/user");
const { subscribeMessage } = require("./utils/queue");

const initializeServer = async () => {
  await connectDb();
  const app = express();
  app.use(express.json());
  app.use(userRoutes);
  app.use(errorHandler);
  subscribeMessage();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
initializeServer();
