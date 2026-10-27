const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    templateId: {
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
    formatBadge: {
      type: String,
      default: '.DOCX'
    },
    iconName: {
      type: String,
      default: 'FileText'
    },
    theme: {
      type: String,
      default: 'blue'
    },
    fileSize: {
      type: String,
      default: '1.0 MB'
    },
    updatedDate: {
      type: String,
      default: ''
    },
    downloadUrl: {
      type: String,
      default: ''
    },
    hasOverleafLink: {
      type: Boolean,
      default: false
    },
    overleafUrl: {
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
        ret.id = ret.templateId;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.templateId;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Template', templateSchema);
