# Sankalp — Smart Campus Recruitment & Placement Portal

A full-stack campus placement platform for Students, Recruiters, Placement
Officers and Admins. MERN stack (MongoDB, Express, React/Vite, Node).

Unique, fully functional features: automatic eligibility engine, rule-based
job-match scoring, placement readiness score, resume skill-gap analysis,
personalized 4-week prep roadmap, skill-demand analytics, bulk shortlisting,
interview scheduling, in-app + optional email notifications, and a full
placement analytics dashboard — all with deterministic rule-based fallbacks,
so **no AI API key is required** for the app to work.

## Project structure

```
campus-portal/
  backend/      Express + MongoDB REST API
  frontend/     React + Vite + Tailwind SPA
```

## 1. Prerequisites

- Node.js 18+
- MongoDB running locally (or an Atlas connection string)

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env     # edit values if needed (defaults work for local Mongo)
npm run seed              # populates demo students, companies, drives, applications
npm run dev                # starts the API on http://localhost:5000
```

### Environment variables (`backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | defaults to 5000 |
| `MONGO_URI` | yes | e.g. `mongodb://127.0.0.1:27017/campus_placement` |
| `JWT_SECRET` | yes | any long random string |
| `JWT_EXPIRES_IN` | no | defaults to `7d` |
| `CLIENT_URL` | no | for CORS, defaults to `*` |
| `SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM` | no | if unset, notifications stay in-app only |
| `AI_API_KEY` | no | not required — resume/skill matching uses a deterministic rule-based engine |

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL defaults to http://localhost:5000/api
npm run dev                 # starts the SPA on http://localhost:5173
```

Open http://localhost:5173.

## 4. Demo login credentials (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@campus.edu | Admin@123 |
| Placement Officer | officer@campus.edu | Officer@123 |
| Student | student1@campus.edu (…student18) | Student@123 |
| Recruiter | recruiter1@technova.com (…recruiter5) | Recruiter@123 |

The login page also has one-click buttons to fill these in.

## 5. Demonstration flow

1. **Student**: login → Profile (already seeded, or edit) → Resume & Skills →
   Browse Drives (match % + eligibility shown per drive) → open a drive →
   Apply → Applications (status tracker) → Interviews → Readiness → Roadmap.
2. **Recruiter**: login → Company (create/edit, pending officer approval) →
   Post a Drive (define eligibility) → My Drives → Applicants (filter/sort/
   bulk shortlist, schedule interviews) → Interviews (mark pass/fail).
3. **Placement Officer**: login → Dashboard → Companies (approve/reject) →
   Drives (approve/reject — approval notifies eligible students) → Students
   (verify profiles) → Applications (monitor) → Analytics (charts).
4. **Admin**: same analytics/companies/drives views plus a Users overview.

## 6. Architecture notes

- **Auth**: JWT (7-day expiry) + bcrypt password hashing, role stored on the
  User document, `protect` + `authorize(...roles)` middleware guard every
  route.
- **Eligibility engine** (`backend/utils/eligibility.js`): deterministic rules
  over CGPA, backlogs, department, graduation year, certifications and
  experience; returns eligible/ineligible + human-readable reasons.
- **Matching engine** (`backend/utils/matching.js`): weighted score (required
  skills 50%, preferred skills 20%, CGPA headroom 15%, certifications 10%,
  experience 5%), capped when the student is ineligible. Never presented as a
  selection guarantee.
- **Readiness score** (`backend/utils/readiness.js`): weighted blend of
  profile completion, resume completeness, technical skill count, projects/
  internships, and interview-prep activity.
- **Roadmap generator** (`backend/utils/roadmap.js`): builds a 4-week plan
  from skill gaps found across currently open drives.
- **Resume analysis** (`backend/utils/resumeParser.js`): rule-based keyword/
  regex extraction (name/email/phone/skills/sections) that runs without any
  external API — a student pastes resume text and the fields are extracted
  and merged back into their profile.
- **Notifications** (`backend/utils/notifyService.js`): always stores an
  in-app notification; sends an email too if SMTP credentials are present in
  `.env`, otherwise silently stays in-app-only — the app works either way.
- A **Job** document doubles as the **placement drive**: it carries drive
  date, deadline, eligibility, and an approval workflow
  (`pending_approval → approved/rejected`, editing sends it back to
  `pending_approval`).

## 7. Key REST endpoints

See `backend/routes/*.js` for the full list. Highlights:
`POST /api/auth/register|login`, `GET/PUT /api/students/profile`,
`POST /api/students/resume`, `GET /api/students/readiness`,
`GET /api/students/roadmap`, `GET/POST /api/jobs`,
`PUT /api/jobs/:id/approve|reject`, `POST /api/applications`,
`PUT /api/applications/:id/status`, `PUT /api/applications/bulk-status`,
`POST /api/interviews`, `PUT /api/companies/:id/status`,
`GET /api/analytics/dashboard|skills|placements`.

## 8. Known simplifications (documented, not hidden)

- A "Placement Drive" is modeled as a `Job` document (drive date + deadline +
  eligibility live on the same document) rather than a separate collection,
  to avoid duplicating data between the two.
- Resume "analysis" is rule-based text extraction from pasted resume text
  (student can paste the text, or PDF text once copied) rather than binary
  PDF parsing — this keeps the feature working with zero external
  dependencies, as required.
- The Admin "Users" page is composed from the students + companies endpoints
  rather than a separate all-users listing, since the app has no
  UI-facing "raw user" management need beyond that.
