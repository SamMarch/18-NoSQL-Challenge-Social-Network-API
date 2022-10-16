const { User, Thought } = require("../models");

getThoughts = (req, res) => {
  Thought.find({})
    .select("-__v")
    .then((dbThoughtData) => res.json(dbThoughtData))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
};

getSingleThought = (req, res) => {
  Thought.findOne({ _id: req.params.thoughtId })
    .populate({
      path: "reactions",
      select: "-__v",
    })
    .select("-__v")
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found with this id!" });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
};

updateThought = (req, res) => {
  Thought.findOneAndUpdate(
    { _id: req.params.thoughtId },
    { $set: req.body },
    { runValidators: true, new: true }
  )
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found with this id!" });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err) => res.status(400).json(err));
};

createThought = (req, res) => {
  Thought.create(req.body)
    .then((dbThoughtData) => {
      return User.findByIdAndUpdate(
        req.body.userId,
        { $addToSet: { thoughts: dbThoughtData._id } },
        { new: true, runValidators: true }
      );
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => res.status(400).json(err));
};

// create a deletethought function that finds the thought by id and deletes it using async/await
deleteThought = async (req, res) => {
  try {
    const { thoughtId } = req.params;
    console.log(thoughtId);
    const thought = await Thought.findById(thoughtId).select("-__v");
    console.log(thought);
    await User.findOneAndUpdate(
      { username: thought.username },
      { $pull: { thoughts: thought._id } }
    );
    await thought.deleteOne();
    res.json({ message: "Thought deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

createReaction = (req, res) => {
  Thought.findOneAndUpdate(
    { _id: req.params.thoughtId },
    { $push: { reactions: req.body } },
    { new: true }
  )
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found with this id!" });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err) => res.status(400).json(err));
};

deleteReaction = (req, res) => {
  Thought.findOneAndUpdate(
    { _id: req.params.thoughtId },
    { $pull: { reactions: { _id: req.params.reactionId } } },
    { new: true }
  )
    .then((dbThoughtData) => res.json(dbThoughtData))
    .catch((err) => res.json(err));
};

module.exports = {
  getThoughts,
  getSingleThought,
  createThought,
  updateThought,
  deleteThought,
  createReaction,
  deleteReaction,
};
