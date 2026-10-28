const mongoose = require('mongoose');

const supervisorProfileSchema = new mongoose.Schema(
  {
    profileId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Supervisor name is required'],
      trim: true
    },
    designation: {
      type: String,
      default: 'Lecturer',
      trim: true
    },
    department: {
      type: String,
      default: 'Dept. of CSE',
      trim: true
    },
    papers: {
      type: Number,
      default: 0
    },
    openSlots: {
      type: Number,
      default: 3
    },
    tags: {
      type: [String],
      default: []
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    scholar: {
      type: String,
      default: '',
      trim: true
    },
    researchgate: {
      type: String,
      default: '',
      trim: true
    },
    linkedin: {
      type: String,
      default: '',
      trim: true
    },
    bio: {
      type: String,
      default: '',
      trim: true
    },
    custom: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.profileId;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.profileId;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('SupervisorProfile', supervisorProfileSchema);
