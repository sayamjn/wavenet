const express = require('express');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  removeAccess
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const { apiLimiter, shareLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);

router.use(apiLimiter);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

router.post('/:id/share', shareLimiter, shareNote);
router.delete('/:id/share/:userId', removeAccess);

module.exports = router;