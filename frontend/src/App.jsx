import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateDetails from './pages/CandidateDetails'; // 👈 IMPORT KAR LIYA
import Interviews from './pages/Interviews';
import Jobs from './pages/Jobs'; 
import JobDetails from './pages/JobDetails';
import HiredCandidates from './pages/HiredCandidates';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (Wrapped in Layout) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* JOBS ROUTES */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          
          {/* CANDIDATES ROUTES */}
          <Route path="candidates" element={<Candidates />} />
          <Route path="candidates/:id" element={<CandidateDetails />} /> {/* 👈 YE ADD KAR DIYA */}

          <Route path="/hired" element={<HiredCandidates />} />
          
          <Route path="interviews" element={<Interviews />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;