const express = require('express');
const router = express.Router();
const { createFiling, getAllFilings, getFilingById, updateFiling, deleteFiling, submitForReview, approveFiling, rejectFiling, addFilingItem } = require('../Controller/filingController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createFiling);
router.get('/', verifyToken, getAllFilings);
router.get('/:id', verifyToken, getFilingById);
router.put('/:id', verifyToken, updateFiling);
router.delete('/:id', verifyToken, deleteFiling);

router.post('/:id/submit-for-review', verifyToken, requireRole('STAFF'), submitForReview);
router.post('/:id/approve', verifyToken, requireRole('REVIEWER'), approveFiling);
router.post('/:id/reject', verifyToken, requireRole('REVIEWER'), rejectFiling);
router.post('/:id/items', verifyToken, addFilingItem);

module.exports = router;