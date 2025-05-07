const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;