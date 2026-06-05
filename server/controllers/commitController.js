const fs = require('fs-extra');
const path = require('path');
const unzipper = require('unzipper');
const Commit = require('../models/Commit');
const Repository = require('../models/Repository');

exports.pushCode = async (req, res) => {
  try {
    const { id } = req.params; // Repo ID
    const { message } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const repo = await Repository.findById(id);
    if (!repo) {
      // Clean up temp file
      await fs.remove(req.file.path);
      return res.status(404).json({ message: 'Repository not found' });
    }

    // Determine extract path: uploads/<repoId>/<commitTimestamp>
    const commitFolder = Date.now().toString();
    const extractPath = path.join(__dirname, '..', 'uploads', id, commitFolder);
    
    await fs.ensureDir(extractPath);

    // Unzip the file
    await fs.createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    // Clean up the uploaded zip file
    await fs.remove(req.file.path);

    // Save commit record
    const commit = new Commit({
      message,
      repositoryId: id,
      uploader: req.user._id,
      folderPath: `uploads/${id}/${commitFolder}`
    });

    const savedCommit = await commit.save();

    res.status(201).json({
      message: 'Code pushed successfully',
      commit: savedCommit
    });
  } catch (error) {
    console.error('Push error:', error);
    if (req.file) await fs.remove(req.file.path).catch(e => {});
    res.status(500).json({ message: error.message });
  }
};

exports.getCommits = async (req, res) => {
  try {
    const commits = await Commit.find({ repositoryId: req.params.id })
      .populate('uploader', 'username')
      .sort({ createdAt: -1 });
    res.json(commits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
