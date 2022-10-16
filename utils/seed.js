const connection = require("../config/connection");
const { User, Thought } = require("../models");
const { users, thoughts } = require("./data");

connection.on("error", (err) => err);

connection.once("open", async () => {
  try {
    await connection.db.dropDatabase();
    await User.create(users);
    const createdThoughts = await Thought.create(thoughts, { new: true });
    createdThoughts.forEach(async (thought) => {
      console.log(thought);
      await User.findOneAndUpdate(
        { username: thought.username },
        { $addToSet: { thoughts: thought._id } },
        { new: true }
      );
    });
    // await User.updateMany({}, { $set: { friends: friends } });
    console.log("Database seeded!");
    // process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
