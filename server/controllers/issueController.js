const Issue = require('../models/Issue');

exports.getIssues = async (req, res) => {
  try {
    const issues = await Issue.find().populate('assignedTo', 'username').populate('createdBy', 'username').populate('repositoryId', 'repoName');
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createIssue = async (req, res) => {
  const { title, description, repositoryId, assignedTo } = req.body;
  try {
    const issue = new Issue({
      title,
      description,
      repositoryId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id
    });
    const createdIssue = await issue.save();
    res.status(201).json(createdIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    Object.assign(issue, req.body);
    const updatedIssue = await issue.save();
    res.json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    if (issue.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await issue.deleteOne();
    res.json({ message: 'Issue removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
