const express = require("express");
const connectDb = require("./db/database");
const errorHandler = require("./middlewares/errorHandler");
const { PORT } = require("./config");
const contactRoutes = require("./routes/contact");

const initializeServer = async () => {
  const app = express();
  await connectDb();

  app.use(express.json());
  app.use(contactRoutes);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

initializeServer();
