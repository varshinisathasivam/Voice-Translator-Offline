const express = require('express');
const router = express.Router();
const { getHistory, deleteHistory, clearHistory, toggleFavorite, getStats } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getHistory);
router.get('/stats', protect, getStats);
router.delete('/clear', protect, clearHistory);
router.delete('/:id', protect, deleteHistory);
router.put('/:id/favorite', protect, toggleFavorite);

module.exports = router;
