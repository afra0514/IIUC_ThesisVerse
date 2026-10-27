const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    points: { type: [String], default: [] }
  },
  { _id: false }
);

const guidelineSchema = new mongoose.Schema(
  {
    guidelineId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    iconName: {
      type: String,
      default: 'BookOpen'
    },
    tags: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      default: 0
    },
    details: {
      subtitle: { type: String, default: '' },
      stages: { type: [stageSchema], default: [] }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.guidelineId;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.guidelineId;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Guideline', guidelineSchema);
