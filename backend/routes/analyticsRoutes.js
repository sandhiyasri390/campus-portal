const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ctrl = require('../controllers/analyticsController');

router.use(protect, authorize('officer', 'admin'));

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/skills', ctrl.getSkillAnalytics);
router.get('/placements', ctrl.getPlacementAnalytics);

module.exports = router;
