const express = require('express');
const router = express.Router();
const { getPRs, createPR, updatePR, deletePR } = require('../controllers/prController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getPRs).post(protect, createPR);
router.route('/:id').put(protect, updatePR).delete(protect, deletePR);

module.exports = router;
