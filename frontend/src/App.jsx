import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentProfilePage from './pages/student/Profile.jsx';
import StudentJobs from './pages/student/Jobs.jsx';
import StudentJobDetail from './pages/student/JobDetail.jsx';
import StudentApplications from './pages/student/Applications.jsx';
import StudentInterviews from './pages/student/Interviews.jsx';
import StudentSkills from './pages/student/Skills.jsx';
import StudentReadiness from './pages/student/Readiness.jsx';
import StudentRoadmap from './pages/student/Roadmap.jsx';
import StudentNotifications from './pages/student/Notifications.jsx';

import RecruiterDashboard from './pages/recruiter/Dashboard.jsx';
import RecruiterCompany from './pages/recruiter/Company.jsx';
import RecruiterJobs from './pages/recruiter/Jobs.jsx';
import RecruiterJobCreate from './pages/recruiter/JobCreate.jsx';
import RecruiterApplicants from './pages/recruiter/Applicants.jsx';
import RecruiterInterviews from './pages/recruiter/Interviews.jsx';

import OfficerDashboard from './pages/officer/Dashboard.jsx';
import OfficerCompanies from './pages/officer/Companies.jsx';
import OfficerDrives from './pages/officer/Drives.jsx';
import OfficerStudents from './pages/officer/Students.jsx';
import OfficerApplications from './pages/officer/Applications.jsx';
import OfficerAnalytics from './pages/officer/Analytics.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/student/jobs" element={<ProtectedRoute roles={['student']}><StudentJobs /></ProtectedRoute>} />
      <Route path="/student/jobs/:id" element={<ProtectedRoute roles={['student']}><StudentJobDetail /></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute roles={['student']}><StudentApplications /></ProtectedRoute>} />
      <Route path="/student/interviews" element={<ProtectedRoute roles={['student']}><StudentInterviews /></ProtectedRoute>} />
      <Route path="/student/skills" element={<ProtectedRoute roles={['student']}><StudentSkills /></ProtectedRoute>} />
      <Route path="/student/readiness" element={<ProtectedRoute roles={['student']}><StudentReadiness /></ProtectedRoute>} />
      <Route path="/student/roadmap" element={<ProtectedRoute roles={['student']}><StudentRoadmap /></ProtectedRoute>} />
      <Route path="/student/notifications" element={<ProtectedRoute roles={['student']}><StudentNotifications /></ProtectedRoute>} />

      <Route path="/recruiter/dashboard" element={<ProtectedRoute roles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/company" element={<ProtectedRoute roles={['recruiter']}><RecruiterCompany /></ProtectedRoute>} />
      <Route path="/recruiter/jobs" element={<ProtectedRoute roles={['recruiter']}><RecruiterJobs /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/create" element={<ProtectedRoute roles={['recruiter']}><RecruiterJobCreate /></ProtectedRoute>} />
      <Route path="/recruiter/applicants" element={<ProtectedRoute roles={['recruiter']}><RecruiterApplicants /></ProtectedRoute>} />
      <Route path="/recruiter/interviews" element={<ProtectedRoute roles={['recruiter']}><RecruiterInterviews /></ProtectedRoute>} />

      <Route path="/officer/dashboard" element={<ProtectedRoute roles={['officer']}><OfficerDashboard /></ProtectedRoute>} />
      <Route path="/officer/companies" element={<ProtectedRoute roles={['officer']}><OfficerCompanies /></ProtectedRoute>} />
      <Route path="/officer/drives" element={<ProtectedRoute roles={['officer']}><OfficerDrives /></ProtectedRoute>} />
      <Route path="/officer/students" element={<ProtectedRoute roles={['officer']}><OfficerStudents /></ProtectedRoute>} />
      <Route path="/officer/applications" element={<ProtectedRoute roles={['officer']}><OfficerApplications /></ProtectedRoute>} />
      <Route path="/officer/analytics" element={<ProtectedRoute roles={['officer']}><OfficerAnalytics /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/companies" element={<ProtectedRoute roles={['admin']}><OfficerCompanies /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute roles={['admin']}><OfficerDrives /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><OfficerAnalytics /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
