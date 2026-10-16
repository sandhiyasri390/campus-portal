const Company = require('../models/Company');
const RecruiterProfile = require('../models/RecruiterProfile');
const { notify } = require('../utils/notifyService');

exports.createCompany = async (req, res) => {
  const { name, industry, website, description, location, logoUrl } = req.body;
  const company = await Company.create({
    name, industry, website, description, location, logoUrl,
    createdBy: req.user.id,
    status: 'pending',
  });
  await RecruiterProfile.findOneAndUpdate({ user: req.user.id }, { company: company._id });
  res.status(201).json({ company });
};

exports.listCompanies = async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (req.user.role === 'recruiter') filter.createdBy = req.user.id;
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const companies = await Company.find(filter).populate('createdBy', 'name email').sort('-createdAt');
  res.json({ count: companies.length, companies });
};

exports.getCompanyById = async (req, res) => {
  const company = await Company.findById(req.params.id).populate('createdBy', 'name email');
  if (!company) return res.status(404).json({ message: 'Company not found' });
  res.json({ company });
};

exports.updateCompany = async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  if (String(company.createdBy) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const editable = ['name', 'industry', 'website', 'description', 'location', 'logoUrl'];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) company[f] = req.body[f];
  });
  await company.save();
  res.json({ company });
};

exports.updateCompanyStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { status, reviewedBy: req.user.id, reviewedAt: new Date(), rejectionReason: rejectionReason || '' },
    { new: true }
  );
  if (!company) return res.status(404).json({ message: 'Company not found' });

  await notify({
    recipient: company.createdBy,
    title: `Company ${status}`,
    message:
      status === 'approved'
        ? `Your company "${company.name}" has been approved. You can now post placement drives.`
        : `Your company "${company.name}" was ${status}. ${rejectionReason || ''}`,
    type: status === 'approved' ? 'company_approved' : 'company_rejected',
  });

  res.json({ company });
};
