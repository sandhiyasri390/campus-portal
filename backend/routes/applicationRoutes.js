const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ctrl = require('../controllers/applicationController');

router.use(protect);

router.post('/', authorize('student'), ctrl.applyToJob);
router.get('/my', authorize('student'), ctrl.getMyApplications);
router.put('/bulk-status', authorize('recruiter', 'officer', 'admin'), ctrl.bulkUpdateStatus);
router.get('/job/:jobId', authorize('recruiter', 'officer', 'admin'), ctrl.listApplicationsForJob);
router.get('/:id', ctrl.getApplicationById);
router.put('/:id/status', authorize('recruiter', 'officer', 'admin'), ctrl.updateApplicationStatus);

module.exports = router;
