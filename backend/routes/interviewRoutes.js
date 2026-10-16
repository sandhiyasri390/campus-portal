const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ctrl = require('../controllers/interviewController');

router.use(protect);

router.post('/', authorize('recruiter', 'officer', 'admin'), ctrl.scheduleInterview);
router.get('/', ctrl.listInterviews);
router.put('/:id', authorize('recruiter', 'officer', 'admin'), ctrl.updateInterview);

module.exports = router;
