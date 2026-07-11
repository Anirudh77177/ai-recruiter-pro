import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateDetails from './pages/CandidateDetails';
import Interviews from './pages/Interviews';
import InterviewRoom from './pages/InterviewRoom'; // 👈 Naya Import
import Jobs from './pages/Jobs'; 
import JobDetails from './pages/JobDetails';
import HiredCandidates from './pages/HiredCandidates';
import CandidateJobs from './pages/CandidateJobs'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Candidate Portal (Public/Separate Layout) */}
        <Route path="/jobs-portal" element={<CandidateJobs />} /> 
        
        {/* Protected Recruiter Routes (Wrapped in Layout) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* JOBS ROUTES (Recruiter View) */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          
          {/* CANDIDATES ROUTES */}
          <Route path="candidates" element={<Candidates />} />
          <Route path="candidates/:id" element={<CandidateDetails />} />

          <Route path="hired" element={<HiredCandidates />} />
          
          {/* INTERVIEW ROUTES */}
          <Route path="interviews" element={<Interviews />} />
          <Route path="interview/:id" element={<InterviewRoom />} /> {/* 👈 Naya Route */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;