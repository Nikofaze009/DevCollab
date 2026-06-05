const express = require('express');
const router = express.Router();
const {
  getRepos, getRepoById, createRepo, updateRepo, deleteRepo,
  getRepoTree, getFileContent
} = require('../controllers/repoController');
const { pushCode, getCommits } = require('../controllers/commitController');
const { protect } = require('../middleware/authMiddleware');
const { planGuard } = require('../middleware/planGuard');
const Repository = require('../models/Repository');
const multer = require('multer');
const upload = multer({ dest: 'temp_uploads/' });

// Count user's own repos for plan enforcement
const countUserRepos = async (req) => {
  return await Repository.countDocuments({ owner: req.user._id });
};

router.route('/')
  .get(protect, getRepos)
  .post(protect, planGuard('maxPublicRepos', countUserRepos), createRepo);

router.route('/:id')
  .get(protect, getRepoById)
  .put(protect, updateRepo)
  .delete(protect, deleteRepo);

router.route('/:id/push').post(protect, upload.single('code'), pushCode);
router.route('/:id/commits').get(protect, getCommits);
router.route('/:id/tree').get(protect, getRepoTree);
router.route('/:id/blob').get(protect, getFileContent);

module.exports = router;
