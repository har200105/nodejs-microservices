const ampqlib = require("amqplib");
const {
  EXCHANGE_NAME,
  MESSAGE_BROKER_URL,
  USER_BINDING_KEY,
} = require("../config");

const createChannel = async () => {
  try {
    const conn = await ampqlib.connect(MESSAGE_BROKER_URL);
    const channel = await conn.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    return channel;
  } catch (err) {
    console.log(err);
  }
};


const publishMessage = async (message) => {
  try {
    let channel = await createChannel();
    channel.publish(EXCHANGE_NAME, USER_BINDING_KEY, Buffer.from(message));
    console.log("Message from Contact service is published" + message);
  } catch (err) {
    console.log(err);
  }
};

const subscribeMessage = async () => {
  let channel = await createChannel();
  const appQueue = await channel.assertQueue(QUEUE_NAME);
  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, USER_BINDING_KEY);
  channel.consume(appQueue.queue, (data) => {
    console.log("The User Service Data Received", data);
  });
};

module.exports = {
  publishMessage,
};
