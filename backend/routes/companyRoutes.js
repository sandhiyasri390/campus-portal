const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ctrl = require('../controllers/companyController');

router.use(protect);

router.post('/', authorize('recruiter', 'admin'), ctrl.createCompany);
router.get('/', ctrl.listCompanies);
router.get('/:id', ctrl.getCompanyById);
router.put('/:id', authorize('recruiter', 'admin'), ctrl.updateCompany);
router.put('/:id/status', authorize('officer', 'admin'), ctrl.updateCompanyStatus);

module.exports = router;
