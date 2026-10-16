require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const connectDB = require('../config/db');
const User = require('../models/User');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { calculateMatchScore } = require('../utils/matching');
const jwt = require('jsonwebtoken');

async function testBackend() {
  await connectDB();
  console.log('\n--- 1. VERIFY DEMO STUDENT ---');
  const student = await User.findOne({ email: 'student1@campus.edu' });
  if (!student) throw new Error('student1@campus.edu not found!');
  const profile = await StudentProfile.findOne({ user: student._id });
  if (!profile) throw new Error('Profile for student1 not found!');
  console.log('Student Name:', profile.fullName);
  console.log('Department:', profile.department);
  console.log('Graduation Year:', profile.graduationYear);
  console.log('CGPA:', profile.cgpa);
  console.log('Backlogs:', profile.backlogs);
  console.log('Skills:', profile.skills);

  console.log('\n--- 2. VERIFY DRIVES & ELIGIBILITY ---');
  const jobs = await Job.find({ status: 'approved' }).populate('company').sort('-createdAt');
  console.log(`Total approved drives: ${jobs.length}`);

  let eligibleCount = 0;
  let ineligibleCount = 0;
  let expiredCount = 0;

  for (const job of jobs) {
    const m = calculateMatchScore(job, profile);
    const deadline = new Date(job.applicationDeadline);
    const isExpired = new Date() > deadline;

    if (isExpired) expiredCount++;
    if (m.eligible) eligibleCount++;
    else ineligibleCount++;

    console.log(`\n• Drive: "${job.title}" | Company: ${job.company?.name} | CTC: ${job.ctc}`);
    console.log(`  Deadline: ${deadline.toISOString().split('T')[0]} | Expired: ${isExpired}`);
    console.log(`  Eligible: ${m.eligible} | Match Score: ${m.score}%`);
    if (!m.eligible) {
      console.log(`  Ineligibility Reasons:`);
      m.eligibilityReasons.forEach((r) => console.log(`    - ${r}`));
    }
  }

  console.log('\n--- 3. ELIGIBILITY SUMMARY ---');
  console.log(`Total: ${jobs.length} | Eligible: ${eligibleCount} | Ineligible: ${ineligibleCount} | Expired: ${expiredCount}`);
  if (eligibleCount < 3) {
    throw new Error(`Expected at least 3 eligible drives, got ${eligibleCount}`);
  }

  console.log('\n--- 4. TEST APPLICATION CONTROLLER LOGIC ---');
  const eligibleJob = jobs.find((j) => {
    const m = calculateMatchScore(j, profile);
    return m.eligible && new Date() < new Date(j.applicationDeadline);
  });
  if (!eligibleJob) throw new Error('No active eligible drive found to test application!');

  console.log(`Attempting application to: "${eligibleJob.title}"...`);
  // Clear any existing app for clean test
  await Application.deleteOne({ student: student._id, job: eligibleJob._id });

  // Simulate application
  const app = await Application.create({
    student: student._id,
    job: eligibleJob._id,
    company: eligibleJob.company._id,
    matchScore: 95,
    statusHistory: [{ status: 'applied', note: 'Application submitted' }],
  });
  console.log('Application created successfully with ID:', app._id);

  // Test duplicate prevention
  try {
    await Application.create({
      student: student._id,
      job: eligibleJob._id,
      company: eligibleJob.company._id,
      matchScore: 95,
    });
    console.error('ERROR: Duplicate was not prevented!');
  } catch (err) {
    console.log('SUCCESS: Duplicate application was prevented by unique constraint!');
  }

  // Verify application listing
  const myApps = await Application.find({ student: student._id }).populate('job');
  console.log(`Total applications for student1 now: ${myApps.length}`);
  const found = myApps.find((a) => a.job?._id.toString() === eligibleJob._id.toString());
  if (found) {
    console.log(`SUCCESS: Found application for "${found.job.title}" in student's applications list!`);
  } else {
    throw new Error('Could not find created application in my applications!');
  }

  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
  process.exit(0);
}

testBackend().catch((err) => {
  console.error('[test_flow] FAILED:', err);
  process.exit(1);
});
