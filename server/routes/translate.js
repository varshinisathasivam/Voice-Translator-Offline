const express = require('express');
const router = express.Router();
const { translate, getLanguages } = require('../controllers/translateController');
const { protect } = require('../middleware/auth');

router.get('/languages', getLanguages);
router.post('/', protect, translate);

module.exports = router;
