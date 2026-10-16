require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');

async function inspect() {
  await connectDB();
  const user = await User.findOne({ email: 'student1@campus.edu' });
  console.log('--- DEMO STUDENT USER ---');
  console.log(user ? { id: user._id, email: user.email, name: user.name, role: user.role } : 'Not found');
  
  if (user) {
    const profile = await StudentProfile.findOne({ user: user._id });
    console.log('--- DEMO STUDENT PROFILE ---');
    if (profile) {
      console.log('Name:', profile.fullName);
      console.log('Department:', profile.department);
      console.log('Graduation Year:', profile.graduationYear);
      console.log('CGPA:', profile.cgpa);
      console.log('Backlogs:', profile.backlogs);
      console.log('Skills:', profile.skills);
      console.log('Programming Languages:', profile.programmingLanguages);
      console.log('Certifications:', profile.certifications);
    } else {
      console.log('Profile not found');
    }

    const apps = await Application.find({ student: user._id }).populate('job');
    console.log('--- STUDENT APPLICATIONS (' + apps.length + ') ---');
    apps.forEach(a => {
      console.log('- App ID:', a._id, '| Job:', a.job ? a.job.title : 'No job', '| Status:', a.status, '| Match:', a.matchScore);
    });
  }

  const jobs = await Job.find({}).populate('company');
  console.log('--- TOTAL JOBS IN DB (' + jobs.length + ') ---');
  jobs.forEach(j => {
    console.log('- Title:', j.title, '| Company:', j.company ? j.company.name : 'None', '| Deadline:', j.applicationDeadline, '| Status:', j.status);
    console.log('  Eligibility:', JSON.stringify(j.eligibility));
    console.log('  Required skills:', JSON.stringify(j.requiredSkills));
  });

  await mongoose.connection.close();
  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
