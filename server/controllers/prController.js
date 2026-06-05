const PullRequest = require('../models/PullRequest');

exports.getPRs = async (req, res) => {
  try {
    const prs = await PullRequest.find().populate('createdBy', 'username').populate('repositoryId', 'repoName');
    res.json(prs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPR = async (req, res) => {
  const { title, description, repositoryId } = req.body;
  try {
    const pr = new PullRequest({
      title,
      description,
      repositoryId,
      createdBy: req.user._id
    });
    const createdPR = await pr.save();
    res.status(201).json(createdPR);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePR = async (req, res) => {
  try {
    const pr = await PullRequest.findById(req.params.id);
    if (!pr) return res.status(404).json({ message: 'Pull Request not found' });
    
    Object.assign(pr, req.body);
    const updatedPR = await pr.save();
    res.json(updatedPR);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePR = async (req, res) => {
  try {
    const pr = await PullRequest.findById(req.params.id);
    if (!pr) return res.status(404).json({ message: 'Pull Request not found' });

    if (pr.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await pr.deleteOne();
    res.json({ message: 'Pull Request removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
