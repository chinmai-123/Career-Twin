import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CareerGoalPage from './pages/CareerGoalPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeHistoryPage from './pages/ResumeHistoryPage';
import AtsAnalysisPage from './pages/AtsAnalysisPage';
import CodingProfilesPage from './pages/CodingProfilesPage';
import SkillVerificationPage from './pages/SkillVerificationPage';
import AssessmentResultPage from './pages/AssessmentResultPage';
import CareerTwinPage from './pages/CareerTwinPage';
import SkillGapPage from './pages/SkillGapPage';
import RoadmapPage from './pages/RoadmapPage';
import AIGuidancePage from './pages/AIGuidancePage';
import ProjectsPage from './pages/ProjectsPage';
import ChallengesPage from './pages/ChallengesPage';
import ProgressPage from './pages/ProgressPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/career-twin" element={<CareerTwinPage />} />
            <Route path="/career-goal" element={<CareerGoalPage />} />
            <Route path="/resume" element={<ResumeUploadPage />} />
            <Route path="/resume-history" element={<ResumeHistoryPage />} />
            <Route path="/ats" element={<AtsAnalysisPage />} />
            <Route path="/coding-profiles" element={<CodingProfilesPage />} />
            <Route path="/skill-verification" element={<SkillVerificationPage defaultTab="MCQ" />} />
            <Route path="/coding-assessment" element={<SkillVerificationPage defaultTab="CODING" />} />
            <Route path="/assessment-results" element={<AssessmentResultPage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/ai-guidance" element={<AIGuidancePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
