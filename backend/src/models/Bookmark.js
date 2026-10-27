const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    items: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Bookmark', bookmarkSchema);
