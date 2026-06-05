const Repository = require('../models/Repository');
const User = require('../models/User');
const Commit = require('../models/Commit');
const fs = require('fs');
const path = require('path');

exports.getRepos = async (req, res) => {
  try {
    const repos = await Repository.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }]
    }).populate('owner', 'username').populate('collaborators', 'username');
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRepoById = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id)
      .populate('owner', 'username')
      .populate('collaborators', 'username');
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRepo = async (req, res) => {
  const { repoName, description, visibility } = req.body;
  try {
    const repo = new Repository({
      repoName,
      description,
      visibility,
      owner: req.user._id,
      collaborators: []
    });
    const createdRepo = await repo.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { repositories: createdRepo._id } });
    res.status(201).json(createdRepo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRepo = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    if (repo.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    Object.assign(repo, req.body);
    const updatedRepo = await repo.save();
    res.json(updatedRepo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRepo = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    if (repo.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await repo.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $pull: { repositories: repo._id } });
    res.json({ message: 'Repository removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recursively build a file tree from a directory
function buildTree(dirPath, relativePath = '') {
  const items = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      items.push({
        name: entry.name,
        type: 'folder',
        path: relPath,
        children: buildTree(fullPath, relPath)
      });
    } else {
      const stat = fs.statSync(fullPath);
      items.push({
        name: entry.name,
        type: 'file',
        path: relPath,
        size: stat.size
      });
    }
  }
  // Folders first, then files
  return items.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });
}

// GET /api/repos/:id/tree
exports.getRepoTree = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });

    // Find the latest commit
    const latestCommit = await Commit.findOne({ repositoryId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('uploader', 'username');

    if (!latestCommit) {
      return res.json({ tree: [], commit: null, message: 'No code pushed yet. Use `dev push` to upload code.' });
    }

    const commitPath = path.join(__dirname, '..', latestCommit.folderPath);
    if (!fs.existsSync(commitPath)) {
      return res.json({ tree: [], commit: latestCommit, message: 'Commit folder not found on server.' });
    }

    const tree = buildTree(commitPath);
    res.json({ tree, commit: latestCommit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/repos/:id/blob?file=path/to/file
exports.getFileContent = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });

    const filePath = req.query.file;
    if (!filePath) return res.status(400).json({ message: 'No file path provided' });

    // Security: prevent path traversal
    const safeFile = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');

    const latestCommit = await Commit.findOne({ repositoryId: req.params.id })
      .sort({ createdAt: -1 });

    if (!latestCommit) return res.status(404).json({ message: 'No commits found' });

    const fullPath = path.join(__dirname, '..', latestCommit.folderPath, safeFile);
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Limit file size to 1MB for text display
    const stat = fs.statSync(fullPath);
    if (stat.size > 1024 * 1024) {
      return res.status(413).json({ message: 'File too large to display (> 1MB)' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    res.json({ content, file: safeFile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
