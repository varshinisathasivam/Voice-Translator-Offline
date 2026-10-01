const express = require('express');
const router = express.Router();
const { upload, uploadAudio, deleteAudio } = require('../controllers/audioController');
const { protect } = require('../middleware/auth');

router.post('/upload', protect, upload.single('audio'), uploadAudio);
router.delete('/:filename', protect, deleteAudio);

module.exports = router;
