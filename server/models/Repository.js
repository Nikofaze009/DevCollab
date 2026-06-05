const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  repoName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Repository', repositorySchema);
