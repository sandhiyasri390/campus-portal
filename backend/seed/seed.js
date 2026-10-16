require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const Skill = require('../models/Skill');

const { calculateMatchScore } = require('../utils/matching');

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'MECH', 'EEE'];
const SKILL_POOL = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'MongoDB',
  'SQL', 'AWS', 'Django', 'C++', 'Git', 'HTML', 'CSS', 'Docker', 'Kubernetes'
];
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Isha', 'Diya', 'Ananya', 'Kabir',
  'Sara', 'Rohan', 'Meera', 'Arjun', 'Priya', 'Karan', 'Neha',
  'Yash', 'Riya', 'Dev', 'Tara', 'Nikhil', 'Pooja'
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Iyer', 'Reddy', 'Nair', 'Gupta', 'Menon',
  'Rao', 'Kapoor', 'Joshi'
];

function pick(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  await connectDB();
  console.log('[seed] Starting safe, idempotent seed...');

  // 1. SKILLS CATALOG
  console.log('[seed] Ensuring skills catalog...');
  for (const name of SKILL_POOL) {
    await Skill.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }

  // 2. ADMIN & OFFICER ACCOUNTS
  console.log('[seed] Ensuring admin & officer accounts...');
  let admin = await User.findOne({ email: 'admin@campus.edu' });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: 'admin@campus.edu',
      password: 'Admin@123',
      role: 'admin',
    });
  }

  let officer = await User.findOne({ email: 'officer@campus.edu' });
  if (!officer) {
    officer = await User.create({
      name: 'Placement Officer',
      email: 'officer@campus.edu',
      password: 'Officer@123',
      role: 'officer',
    });
  }

  // 3. RECRUITERS & COMPANIES
  console.log('[seed] Ensuring recruiters & companies...');
  const companyDefs = [
    { name: 'TechNova Solutions', industry: 'Software', location: 'Bengaluru' },
    { name: 'FinEdge Systems', industry: 'FinTech', location: 'Chennai' },
    { name: 'CloudPeak Technologies', industry: 'Cloud Computing', location: 'Hyderabad' },
    { name: 'DataSphere Analytics', industry: 'Data & AI', location: 'Pune' },
    { name: 'BrightPath Innovations', industry: 'Product', location: 'Chennai' },
  ];

  const companies = [];
  for (const [i, def] of companyDefs.entries()) {
    const email = `recruiter${i + 1}@${def.name.split(' ')[0].toLowerCase()}.com`;
    let recruiterUser = await User.findOne({ email });
    if (!recruiterUser) {
      recruiterUser = await User.create({
        name: `${def.name} Recruiter`,
        email,
        password: 'Recruiter@123',
        role: 'recruiter',
      });
    }

    let company = await Company.findOne({ name: def.name });
    if (!company) {
      company = await Company.create({
        ...def,
        description: `${def.name} is a leading ${def.industry.toLowerCase()} company hiring fresh campus talent.`,
        website: `https://www.${def.name.split(' ')[0].toLowerCase()}.example.com`,
        createdBy: recruiterUser._id,
        status: 'approved',
        reviewedBy: officer._id,
        reviewedAt: new Date(),
      });
    } else {
      company.status = 'approved';
      await company.save();
    }

    await RecruiterProfile.findOneAndUpdate(
      { user: recruiterUser._id },
      {
        fullName: `${def.name} Recruiter`,
        designation: 'HR Manager',
        company: company._id,
      },
      { upsert: true }
    );

    companies.push({ company, recruiterUser });
  }

  // 4. STUDENTS
  console.log('[seed] Ensuring demo student accounts...');
  const students = [];

  // DEMO STUDENT 1: Aarav Sharma (Primary demo account)
  let student1User = await User.findOne({ email: 'student1@campus.edu' });
  if (!student1User) {
    student1User = await User.create({
      name: 'Aarav Sharma',
      email: 'student1@campus.edu',
      password: 'Student@123',
      role: 'student',
    });
  }

  const student1Profile = await StudentProfile.findOneAndUpdate(
    { user: student1User._id },
    {
      fullName: 'Aarav Sharma',
      registerNumber: '21CSE001',
      collegeEmail: 'student1@campus.edu',
      personalEmail: 'aarav.sharma@gmail.com',
      phone: '9876543210',
      department: 'CSE',
      degree: 'B.Tech',
      batch: '2023-2027',
      graduationYear: 2027,
      cgpa: 8.4,
      backlogs: 0,
      skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Python', 'SQL', 'Git'],
      programmingLanguages: ['JavaScript', 'Python', 'Java'],
      certifications: ['AWS Cloud Practitioner'],
      projects: [
        {
          title: 'Campus Event & Placement Portal',
          description: 'A full-stack recruitment and placement management application built with React and Node.js.',
          techStack: ['React', 'Node.js', 'MongoDB'],
          link: 'https://github.com/aaravsharma/campus-portal',
        },
      ],
      internships: [
        {
          company: 'TechNova Solutions',
          role: 'Frontend Intern',
          duration: '3 months',
          description: 'Developed responsive user interfaces, forms, and client dashboard features.',
        },
      ],
      githubUrl: 'https://github.com/aaravsharma',
      linkedinUrl: 'https://linkedin.com/in/aarav-sharma',
      portfolioUrl: 'https://aaravsharma.dev',
      verificationStatus: 'verified',
      targetRole: 'Software Developer',
      preparation: {
        aptitudePracticeCount: 8,
        mockInterviewCount: 3,
        codingPracticeCount: 15,
        communicationScore: 85,
      },
    },
    { upsert: true, new: true }
  );
  students.push({ user: student1User, profile: student1Profile });

  // Additional student accounts (student2 to student18)
  for (let i = 1; i < 18; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[i % LAST_NAMES.length];
    const name = `${first} ${last}`;
    const email = `student${i + 1}@campus.edu`;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password: 'Student@123', role: 'student' });
    }

    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const cgpa = Number((randInt(62, 94) / 10).toFixed(1));
    const skills = pick(SKILL_POOL, randInt(3, 7));

    let profile = await StudentProfile.findOne({ user: user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        user: user._id,
        fullName: name,
        registerNumber: `21${dept}${String(i + 1).padStart(3, '0')}`,
        collegeEmail: email,
        personalEmail: `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
        phone: `9${randInt(100000000, 999999999)}`,
        department: dept,
        degree: 'B.Tech',
        batch: '2023-2027',
        graduationYear: 2027,
        cgpa,
        backlogs: i % 4 === 0 ? 1 : 0,
        skills,
        programmingLanguages: pick(['JavaScript', 'Python', 'Java', 'C++'], randInt(1, 3)),
        certifications: i % 3 === 0 ? ['AWS Cloud Practitioner'] : [],
        projects: [
          {
            title: 'Campus Project Manager',
            description: 'A web app for tracking departmental projects.',
            techStack: pick(skills, 2),
            link: '',
          },
        ],
        internships: i % 3 === 0 ? [{ company: 'Startup Hub', role: 'Intern', duration: '2 months', description: 'Worked on APIs.' }] : [],
        githubUrl: `https://github.com/${first.toLowerCase()}${last.toLowerCase()}`,
        linkedinUrl: `https://linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}`,
        portfolioUrl: '',
        verificationStatus: i % 2 === 0 ? 'verified' : 'pending',
        preparation: {
          aptitudePracticeCount: randInt(1, 10),
          mockInterviewCount: randInt(0, 4),
          codingPracticeCount: randInt(2, 14),
          communicationScore: randInt(50, 90),
        },
        targetRole: 'Software Developer',
      });
    }
    students.push({ user, profile });
  }

  // 5. PLACEMENT DRIVES (JOBS)
  console.log('[seed] Upserting realistic placement drives...');

  const driveDefs = [
    // --- Drive 1: Junior Frontend Developer (Eligible for student1) ---
    {
      companyIndex: 0, // TechNova Solutions (Bengaluru)
      title: 'Junior Frontend Developer',
      jobType: 'full-time',
      ctc: '4–6 LPA',
      location: 'Bengaluru',
      openings: 5,
      description: 'Join TechNova Solutions as a Junior Frontend Developer to build modern, responsive web user interfaces. You will work alongside senior engineers to design intuitive client-side features using React and modern JavaScript.',
      requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS'],
      preferredSkills: ['Git', 'Node.js'],
      selectionProcess: ['Online Aptitude Test', 'Frontend Coding Round', 'Technical & HR Interview'],
      eligibility: {
        minCgpa: 7.0,
        maxBacklogs: 0,
        departments: ['CSE', 'IT', 'ECE'],
        graduationYears: [2027],
        minExperienceMonths: 0,
        requiredCertifications: [],
      },
      applicationDeadline: new Date('2026-10-28T23:59:59.000Z'),
      driveDate: new Date('2026-11-10T09:30:00.000Z'),
    },

    // --- Drive 2: Graduate Software Engineer (Eligible for student1) ---
    {
      companyIndex: 1, // FinEdge Systems (Chennai)
      title: 'Graduate Software Engineer',
      jobType: 'full-time',
      ctc: '5–7 LPA',
      location: 'Chennai',
      openings: 8,
      description: 'FinEdge Systems is recruiting Graduate Software Engineers for its core banking and financial technology teams. You will collaborate on resilient microservices, transactional databases, and scalable backend platforms.',
      requiredSkills: ['JavaScript', 'Python', 'SQL'],
      preferredSkills: ['Git', 'Node.js'],
      selectionProcess: ['Online Assessment', 'Data Structures & Algorithms Round', 'System Design & HR Interview'],
      eligibility: {
        minCgpa: 7.5,
        maxBacklogs: 0,
        departments: ['CSE', 'IT'],
        graduationYears: [2027],
        minExperienceMonths: 0,
        requiredCertifications: [],
      },
      applicationDeadline: new Date('2026-11-05T23:59:59.000Z'),
      driveDate: new Date('2026-11-18T10:00:00.000Z'),
    },

    // --- Drive 3: Web Developer Intern (Eligible for student1) ---
    {
      companyIndex: 4, // BrightPath Innovations (Chennai)
      title: 'Web Developer Intern',
      jobType: 'internship',
      ctc: '₹20,000/month',
      location: 'Chennai',
      openings: 4,
      description: 'BrightPath Innovations is offering a 6-month hands-on Web Developer Internship with PPO opportunity. Work on customer-facing web applications, responsive components, and API integrations with mentorship from senior leads.',
      requiredSkills: ['HTML', 'CSS', 'JavaScript'],
      preferredSkills: ['React', 'Git'],
      selectionProcess: ['Profile Screening', 'Web Development Task', 'HR Discussion'],
      eligibility: {
        minCgpa: 6.5,
        maxBacklogs: 1,
        departments: ['CSE', 'IT', 'ECE', 'EEE', 'MECH'],
        graduationYears: [2027],
        minExperienceMonths: 0,
        requiredCertifications: [],
      },
      applicationDeadline: new Date('2026-10-25T23:59:59.000Z'),
      driveDate: new Date('2026-11-04T10:00:00.000Z'),
    },

    // --- Drive 4: Associate Software Engineer (Ineligible for student1: CGPA 9.0 > 8.4) ---
    {
      companyIndex: 2, // CloudPeak Technologies (Hyderabad)
      title: 'Associate Software Engineer',
      jobType: 'full-time',
      ctc: '4.5–6.5 LPA',
      location: 'Hyderabad',
      openings: 6,
      description: 'CloudPeak Technologies is seeking an Associate Software Engineer to work on distributed cloud infrastructure, microservices, and enterprise integrations requiring high academic distinction.',
      requiredSkills: ['Java', 'SQL', 'AWS'],
      preferredSkills: ['Docker', 'Git'],
      selectionProcess: ['Aptitude & Cloud Fundamentals', 'Technical Coding Round', 'Management Interview'],
      eligibility: {
        minCgpa: 9.0, // High CGPA requirement: student1 has 8.4 -> Ineligible
        maxBacklogs: 0,
        departments: ['CSE', 'IT'],
        graduationYears: [2027],
        minExperienceMonths: 0,
        requiredCertifications: [],
      },
      applicationDeadline: new Date('2026-11-12T23:59:59.000Z'),
      driveDate: new Date('2026-11-25T10:00:00.000Z'),
    },

    // --- Drive 5: Junior Python Developer (Ineligible for student1: Department ECE/EEE/MECH != CSE) ---
    {
      companyIndex: 3, // DataSphere Analytics (Pune)
      title: 'Junior Python Developer',
      jobType: 'full-time',
      ctc: '4–6 LPA',
      location: 'Pune',
      openings: 3,
      description: 'DataSphere Analytics is hiring Junior Python Developers specifically from Electronics and Mechanical engineering streams for industrial automation and IoT data pipelines.',
      requiredSkills: ['Python', 'Django', 'SQL'],
      preferredSkills: ['Docker', 'Git'],
      selectionProcess: ['Technical Assessment', 'Live Coding Challenge', 'HR Round'],
      eligibility: {
        minCgpa: 7.0,
        maxBacklogs: 0,
        departments: ['ECE', 'EEE', 'MECH'], // Not open to CSE -> Ineligible for student1
        graduationYears: [2027],
        minExperienceMonths: 0,
        requiredCertifications: [],
      },
      applicationDeadline: new Date('2026-11-08T23:59:59.000Z'),
      driveDate: new Date('2026-11-22T10:00:00.000Z'),
    },

    // --- Drive 6: Full Stack Engineer Trainee (Eligible for student1) ---
    {
      companyIndex: 4, // BrightPath Innovations (Chennai)
      title: 'Full Stack Engineer Trainee',
      jobType: 'full-time',
      ctc: '6–8.5 LPA',
      location: 'Chennai',
      openings: 5,
      description: 'BrightPath Innovations is hiring Full Stack Engineer Trainees proficient in modern JavaScript web frameworks, REST APIs, and NoSQL databases.',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      preferredSkills: ['AWS', 'Git'],
      selectionProcess: ['Technical Assessment', 'Full Stack System Design', 'HR Interview'],
      eligibility: {
        minCgpa: 8.0,
        maxBacklogs: 0,
        departments: ['CSE', 'IT'],
        graduationYears: [2027],
        minExperienceMonths: 0,
        requiredCertifications: [],
      },
      applicationDeadline: new Date('2026-11-15T23:59:59.000Z'),
      driveDate: new Date('2026-11-30T10:00:00.000Z'),
    },

    // --- Drive 7: Cloud Systems Associate (Ineligible: Missing required skills Docker & Kubernetes) ---
    {
      companyIndex: 2, // CloudPeak Technologies (Hyderabad)
      title: 'Cloud Systems Associate',
      jobType: 'full-time',
      ctc: '5–7 LPA',
      location: 'Hyderabad',
      openings: 4,
      description: 'CloudPeak Technologies requires Cloud Systems Associates to run mission-critical container clusters and continuous integration pipelines.',
      requiredSkills: ['Docker', 'Kubernetes', 'AWS'],
      preferredSkills: ['Linux', 'Git'],
      selectionProcess: ['Containerization Quiz', 'DevOps Scenario Round', 'Technical Interview'],
      eligibility: {
        minCgpa: 7.0,
        maxBacklogs: 0,
        departments: ['CSE', 'IT'],
        graduationYears: [2027],
        strictSkills: true, // Requires Docker & Kubernetes which student1 lacks -> Ineligible
        minExperienceMonths: 0,
        requiredCertifications: [],
      },
      applicationDeadline: new Date('2026-11-02T23:59:59.000Z'),
      driveDate: new Date('2026-11-15T10:00:00.000Z'),
    },

    // --- Drive 8: Systems Engineer Trainee (Expired drive) ---
    {
      companyIndex: 0, // TechNova Solutions (Bengaluru)
      title: 'Systems Engineer Trainee',
      jobType: 'full-time',
      ctc: '3.5–5 LPA',
      location: 'Bengaluru',
      openings: 10,
      description: 'TechNova Solutions Systems Engineer Trainee campus recruitment drive for earlier batch intake.',
      requiredSkills: ['Java', 'SQL'],
      preferredSkills: ['Git'],
      selectionProcess: ['Online Aptitude', 'Coding Test', 'HR Interview'],
      eligibility: {
        minCgpa: 6.0,
        maxBacklogs: 0,
        departments: ['CSE', 'IT'],
        graduationYears: [2027],
        minExperienceMonths: 0,
        requiredCertifications: [],
      },
      applicationDeadline: new Date('2026-10-05T23:59:59.000Z'), // Past deadline -> Expired
      driveDate: new Date('2026-10-12T10:00:00.000Z'),
    },
  ];

  const jobs = [];
  for (const def of driveDefs) {
    const { company, recruiterUser } = companies[def.companyIndex];
    const updateData = {
      company: company._id,
      postedBy: recruiterUser._id,
      title: def.title,
      location: def.location || company.location,
      jobType: def.jobType,
      ctc: def.ctc,
      description: def.description,
      requiredSkills: def.requiredSkills,
      preferredSkills: def.preferredSkills,
      selectionProcess: def.selectionProcess,
      openings: def.openings,
      eligibility: def.eligibility,
      applicationDeadline: def.applicationDeadline,
      driveDate: def.driveDate,
      status: 'approved',
      reviewedBy: officer._id,
      reviewedAt: new Date(),
    };

    const job = await Job.findOneAndUpdate(
      { title: def.title, company: company._id },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    jobs.push(job);
  }

  // 6. APPLICATIONS & INTERVIEWS
  console.log('[seed] Seeding sample application data...');
  const statusCycle = ['applied', 'under_review', 'shortlisted', 'assessment', 'technical_interview', 'hr_interview', 'selected'];
  let appCount = 0;

  // For students 2 to 18, create sample applications
  for (let sIdx = 1; sIdx < students.length; sIdx++) {
    const { user, profile } = students[sIdx];
    const applyToJobs = pick(jobs, randInt(1, 3));
    for (const job of applyToJobs) {
      const m = calculateMatchScore(job, profile);
      if (!m.eligible) continue;

      const existingApp = await Application.findOne({ student: user._id, job: job._id });
      if (existingApp) continue;

      const status = statusCycle[randInt(0, statusCycle.length - 1)];
      try {
        const application = await Application.create({
          student: user._id,
          job: job._id,
          company: job.company,
          matchScore: m.score,
          status,
          statusHistory: [{ status: 'applied' }, ...(status !== 'applied' ? [{ status }] : [])],
        });
        appCount += 1;

        if (['technical_interview', 'hr_interview', 'selected'].includes(status)) {
          await Interview.create({
            application: application._id,
            student: user._id,
            job: job._id,
            scheduledBy: job.postedBy,
            date: new Date(Date.now() + randInt(2, 10) * 86400000),
            time: '10:00 AM',
            type: status === 'hr_interview' || status === 'selected' ? 'hr' : 'technical',
            interviewer: 'Panel Member',
            meetingLink: 'https://meet.example.com/interview',
            status: 'scheduled',
            result: status === 'selected' ? 'pass' : 'pending',
          });
        }
      } catch (e) {
        // duplicate or conflict - skip
      }
    }
  }

  // Ensure demo student 1 has an existing application to Full Stack Engineer Trainee (to verify applications page),
  // but LEAVE Junior Frontend Developer, Graduate Software Engineer, and Web Developer Intern UNAPPLIED
  // so the student can test the Apply Now flow!
  const fullStackDrive = jobs.find((j) => j.title === 'Full Stack Engineer Trainee');
  if (fullStackDrive) {
    const existing = await Application.findOne({ student: student1User._id, job: fullStackDrive._id });
    if (!existing) {
      const m = calculateMatchScore(fullStackDrive, student1Profile);
      await Application.create({
        student: student1User._id,
        job: fullStackDrive._id,
        company: fullStackDrive.company,
        matchScore: m.score,
        status: 'under_review',
        statusHistory: [
          { status: 'applied', note: 'Application submitted' },
          { status: 'under_review', note: 'Profile under review by HR team' },
        ],
      });
      appCount += 1;
    }
  }

  // Remove any application from student1 to the 3 new target drives if previously created,
  // so student1 can genuinely apply to them via the browser!
  const testApplyTitles = ['Junior Frontend Developer', 'Graduate Software Engineer', 'Web Developer Intern'];
  const testApplyJobIds = jobs.filter((j) => testApplyTitles.includes(j.title)).map((j) => j._id);
  await Application.deleteMany({ student: student1User._id, job: { $in: testApplyJobIds } });

  console.log(`[seed] Complete!`);
// Ensure at least one selected application per company for analytics
for (const { company } of companies) {
  const job = await Job.findOne({ company: company._id, status: 'approved' });
  if (!job) continue;
  const studentInfo = students[1]; // use second demo student if available
  if (!studentInfo) continue;
  const existing = await Application.findOne({ student: studentInfo.user._id, job: job._id });
  if (!existing) {
    await Application.create({
      student: studentInfo.user._id,
      job: job._id,
      company: company._id,
      matchScore: 100,
      status: 'selected',
      statusHistory: [{ status: 'applied' }, { status: 'selected' }],
    });
    appCount += 1;
  }
}
  console.log(`  - Students: ${students.length}`);
  console.log(`  - Companies: ${companies.length}`);
  console.log(`  - Placement Drives: ${jobs.length}`);
  console.log(`  - Applications: ${appCount}`);
  console.log('\nDemo Student 1 status for placement drives:');
  for (const job of jobs) {
    const m = calculateMatchScore(job, student1Profile);
    console.log(`  * ${job.title} (${job.ctc}): ${m.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'} | Score: ${m.score}% | Deadline: ${job.applicationDeadline.toISOString().split('T')[0]}`);
    if (!m.eligible) {
      console.log(`    Reasons: ${m.eligibilityReasons.join('; ')}`);
    }
  }

  console.log('\nDemo credentials:');
  console.log('  Student:   student1@campus.edu / Student@123');
  console.log('  Officer:   officer@campus.edu  / Officer@123');
  console.log('  Admin:     admin@campus.edu    / Admin@123');
  console.log('  Recruiter: recruiter1@technova.com / Recruiter@123');

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
