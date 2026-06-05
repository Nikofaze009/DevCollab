const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folderPath: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Commit', commitSchema);
