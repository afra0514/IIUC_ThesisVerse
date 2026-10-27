const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, default: '', trim: true },
    studentId: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const supervisionRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    studentUserId: {
      type: String,
      required: true,
      index: true
    },
    supervisorId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true
    },
    student: {
      name: { type: String, required: true },
      studentId: { type: String, required: true },
      email: { type: String, required: true },
      department: { type: String, default: 'CSE' },
      batch: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    topic: {
      type: String,
      required: [true, 'Thesis topic is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    members: {
      type: [memberSchema],
      default: []
    },
    message: {
      type: String,
      default: '',
      trim: true
    },
    responseNote: {
      type: String,
      default: '',
      trim: true
    },
    respondedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.requestId;
        ret.createdAt = doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now();
        ret.respondedAt = doc.respondedAt ? new Date(doc.respondedAt).getTime() : null;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.requestId;
        ret.createdAt = doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now();
        ret.respondedAt = doc.respondedAt ? new Date(doc.respondedAt).getTime() : null;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('SupervisionRequest', supervisionRequestSchema);
