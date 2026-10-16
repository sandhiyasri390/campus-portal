const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/studentController');

router.use(protect);

router.get('/profile', authorize('student'), ctrl.getMyProfile);
router.put('/profile', authorize('student'), ctrl.updateMyProfile);
router.post('/resume', authorize('student'), upload.single('resume'), ctrl.uploadResume);
router.post('/resume/analyze', authorize('student'), ctrl.analyzeResume);
router.get('/resume/analysis', authorize('student'), ctrl.getResumeAnalysis);
router.get('/readiness', authorize('student'), ctrl.getReadiness);
router.get('/roadmap', authorize('student'), ctrl.getRoadmap);
router.put('/roadmap/tasks/:taskId/toggle', authorize('student'), ctrl.toggleTask);
router.get('/skills/demand', ctrl.getSkillDemand);

router.get('/', authorize('recruiter', 'officer', 'admin'), ctrl.listStudents);
router.get('/:id', authorize('recruiter', 'officer', 'admin'), ctrl.getStudentById);
router.put('/:id/verify', authorize('officer', 'admin'), ctrl.verifyStudent);

module.exports = router;
