const mongoose = require("mongoose");

const searchQueriesSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  lastSearchedAt: {
    type: Date,
    default: Date.now,
  },
});

const SearchQuery = mongoose.model("SearchQuery", searchQueriesSchema);

module.exports = SearchQuery;
