const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ctrl = require('../controllers/jobController');

router.use(protect);

router.get('/', ctrl.listJobs);
router.post('/', authorize('recruiter', 'admin'), ctrl.createJob);
router.get('/:id', ctrl.getJobById);
router.put('/:id', authorize('recruiter', 'admin'), ctrl.updateJob);
router.delete('/:id', authorize('recruiter', 'admin'), ctrl.deleteJob);
router.put('/:id/close', authorize('recruiter', 'admin'), ctrl.closeJob);
router.put('/:id/approve', authorize('officer', 'admin'), ctrl.approveJob);
router.put('/:id/reject', authorize('officer', 'admin'), ctrl.rejectJob);
router.get('/:id/eligible-students', authorize('recruiter', 'officer', 'admin'), ctrl.getEligibleStudentsForJob);

module.exports = router;
