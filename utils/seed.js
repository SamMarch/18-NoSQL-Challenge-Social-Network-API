const connection = require("../config/connection");
const { User, Thought } = require("../models");
const { users, thoughts } = require("./data");

connection.on("error", (err) => err);

connection.once("open", async () => {
  try {
    await connection.db.dropDatabase();
    await User.create(users);
    await Thought.create(thoughts);
    // await User.updateMany({}, { $set: { friends: friends } });
    console.log("Database seeded!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
