const express = require('express');
const router = express.Router();
const { createFiling, getAllFilings, getFilingById, updateFiling, deleteFiling } = require('../Controller/filingController');

router.post('/', createFiling);
router.get('/', getAllFilings);
router.get('/:id', getFilingById);
router.put('/:id', updateFiling);
router.delete('/:id', deleteFiling);

module.exports = router;