const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["bug", "missing_tool", "wrong_info", "feature_request", "general"],
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
