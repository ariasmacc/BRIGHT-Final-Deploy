const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentController');

// --- PUBLIC ROUTE ---
router.get('/', controller.getAllDocuments);

module.exports = router;