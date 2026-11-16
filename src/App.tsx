import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';

// Auth Pages
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';

// Common Pages
import { LandingPage } from '@/features/landing/LandingPage';
import { SetupGuidePage } from '@/components/common/SetupGuidePage';
import { ForbiddenPage } from '@/components/common/ForbiddenPage';
import { NotFoundPage } from '@/components/common/NotFoundPage';

// Jobs & Resume
import { JobsPortalPage } from '@/features/jobs/JobsPortalPage';
import { JobDetailPage } from '@/features/jobs/JobDetailPage';
import { ResumeAnalyzerPage } from '@/features/resume/ResumeAnalyzerPage';

// Tests & Proctoring
import { TestsListPage } from '@/features/tests/TestsListPage';
import { TestTakingPage } from '@/features/tests/TestTakingPage';
import { TestResultsPage } from '@/features/tests/TestResultsPage';

// Dashboards
import { ApplicantDashboard } from '@/features/applicant/ApplicantDashboard';
import { ApplicationTrackerPage } from '@/features/applicant/ApplicationTrackerPage';
import { ApplicantProfilePage } from '@/features/applicant/ApplicantProfilePage';
import { RecruiterDashboard } from '@/features/recruiter/RecruiterDashboard';
import { AdminDashboard } from '@/features/admin/AdminDashboard';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Standalone Fullscreen Test Environment */}
      <Route
        path="/tests/take/:trackId"
        element={
          <ProtectedRoute allowedRoles={['applicant', 'admin']}>
            <TestTakingPage />
          </ProtectedRoute>
        }
      />

      {/* Standalone Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Main Layout Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup-guide" element={<SetupGuidePage />} />

        {/* Jobs Portal */}
        <Route path="/jobs" element={<JobsPortalPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />

        {/* 5-Agent Resume Analyzer */}
        <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />

        {/* Tests Catalog & Results */}
        <Route path="/tests" element={<TestsListPage />} />
        <Route path="/tests/results" element={<TestResultsPage />} />

        {/* Applicant Protected Routes */}
        <Route
          path="/applicant"
          element={
            <ProtectedRoute allowedRoles={['applicant', 'admin']}>
              <ApplicantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant/applications"
          element={
            <ProtectedRoute allowedRoles={['applicant', 'admin']}>
              <ApplicationTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant/profile"
          element={
            <ProtectedRoute allowedRoles={['applicant', 'recruiter', 'admin']}>
              <ApplicantProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Recruiter Protected Routes */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
