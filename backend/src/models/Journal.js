const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    journalId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    shortCode: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#2563EB'
    },
    tierBadge: {
      type: String,
      default: ''
    },
    tierColor: {
      type: String,
      default: 'emerald'
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    searchUrl: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.journalId;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.journalId;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Journal', journalSchema);
