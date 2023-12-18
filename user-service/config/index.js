const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  CONNECTION_STRING: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  USER_BINDING_KEY: process.env.USER_BINDING_KEY,
  QUEUE_NAME: process.env.QUEUE_NAME,
};



