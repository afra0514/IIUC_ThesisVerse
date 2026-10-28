const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    recipient: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      default: 'system'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    requestId: {
      type: String,
      default: ''
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.notificationId;
        ret.createdAt = doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now();
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.notificationId;
        ret.createdAt = doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now();
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
