const express = require('express');
const router = express.Router();
const { getReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.get('/', auth, getReport);

module.exports = router;