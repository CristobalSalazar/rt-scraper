const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Article"
  }
});

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
