import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis, CartesianGrid } from 'recharts';
import { Briefcase, Users, Target, CheckCircle, ShieldAlert, Loader2, FileText, Activity } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [auditReport, setAuditReport] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  
  // States for real data
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    avgScore: 0,
    hired: 0,
    funnel: [],
    topJobs: [],
    recentActivity: []
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch both Jobs and Candidates simultaneously
        const [jobsRes, candRes] = await Promise.all([
          axios.get('http://localhost:5000/api/jobs'),
          axios.get('http://localhost:5000/api/ai/candidates')
        ]);

        const jobs = jobsRes.data.data;
        const candidates = candRes.data.data;
        
        let totalScore = 0;
        let scoredCount = 0;
        let statusCounts = { applied: 0, screening: 0, interviewing: 0, offer: 0, hired: 0, rejected: 0 };
        let jobCounts = {};
        let activities = [];

        // Process Candidates
        candidates.forEach(c => {
          if (c.aiScore > 0) {
            totalScore += c.aiScore;
            scoredCount++;
          }
          
          // Map backend status to funnel stages
          const normalizedStatus = c.status === 'shortlisted' ? 'interviewing' : (c.status || 'applied');
          statusCounts[normalizedStatus] = (statusCounts[normalizedStatus] || 0) + 1;

          // Count for Top Jobs
          jobCounts[c.roleApplied] = (jobCounts[c.roleApplied] || 0) + 1;

          // Generate Recent Activity based on actual data
          let actionText = '';
          if (c.status === 'hired') actionText = `was hired for ${c.roleApplied} 🎉`;
          else if (c.status === 'applied') actionText = `applied for ${c.roleApplied}`;
          else if (c.status === 'shortlisted') actionText = `was shortlisted for ${c.roleApplied}`;
          else if (c.status === 'rejected') actionText = `was rejected for ${c.roleApplied}`;
          else actionText = `'s resume was screened for ${c.roleApplied}`;

          activities.push({
            id: c._id,
            candidateName: c.name,
            action: actionText,
            role: c.roleApplied,
            time: 'Just now' 
          });
        });

        // Format Top Jobs
        const formattedTopJobs = Object.keys(jobCounts).map(role => {
          const matchedJob = jobs.find(j => j.title === role);
          return {
            title: role,
            department: matchedJob ? matchedJob.department : 'General',
            status: matchedJob ? matchedJob.status : 'Active',
            count: jobCounts[role]
          };
        }).sort((a, b) => b.count - a.count).slice(0, 4);

        setStats({
          activeJobs: jobs.length,
          totalCandidates: candidates.length,
          avgScore: scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0,
          hired: statusCounts.hired || statusCounts.offer || 0,
          funnel: [
            { name: 'applied', count: statusCounts.applied || 0 },
            { name: 'screening', count: statusCounts.screening || 0 },
            { name: 'interviewing', count: statusCounts.interviewing || 0 },
            { name: 'offer', count: statusCounts.offer || 0 },
            { name: 'hired', count: statusCounts.hired || 0 },
            { name: 'rejected', count: statusCounts.rejected || 0 },
          ],
          topJobs: formattedTopJobs,
          recentActivity: activities.reverse().slice(0, 5) 
        });

      } catch (error) {
        console.error("Error fetching live data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const fetchBiasAudit = async () => {
    setLoadingAudit(true);
    try {
      const response = await axios.get('http://localhost:5000/api/ai/bias-audit');
      setAuditReport(response.data.data);
    } catch (err) {
      alert('Not enough scored data. Please generate and score CVs via API first.');
    }
    setLoadingAudit(false);
  };

  if (loading) return <div className="flex justify-center items-center h-full py-20"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;

  return (
    <div className="max-w-7xl h-full pb-10">
      
      {/* Real-Time Clickable Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Active Jobs */}
        <div 
          onClick={() => navigate('/jobs')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start cursor-pointer hover:border-violet-300 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 group-hover:text-violet-600 transition-colors">Active Jobs</p>
            <h2 className="text-3xl font-bold text-slate-800">{stats.activeJobs}</h2>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition-colors"><Briefcase size={24} /></div>
        </div>
        
        {/* Card 2: Total Candidates */}
        <div 
          onClick={() => navigate('/candidates')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 group-hover:text-emerald-600 transition-colors">Total Candidates</p>
            <h2 className="text-3xl font-bold text-slate-800">{stats.totalCandidates}</h2>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Users size={24} /></div>
        </div>

        {/* Card 3: Avg AI Match */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start cursor-pointer hover:shadow-md transition-all">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Avg. AI Match</p>
            <h2 className="text-3xl font-bold text-slate-800">{stats.avgScore}%</h2>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Target size={24} /></div>
        </div>

        {/* Card 4: Hired Candidates (Yahan update kiya hai) */}
        <div 
          onClick={() => navigate('/hired')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 group-hover:text-purple-600 transition-colors">Hired Candidates</p>
            <h2 className="text-3xl font-bold text-slate-800">{stats.hired}</h2>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors"><CheckCircle size={24} /></div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dynamic Pipeline Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Activity className="mr-2 text-violet-600" size={20} /> Pipeline Funnel
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.funnel} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                    {stats.funnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'hired' ? '#10b981' : entry.name === 'rejected' ? '#ef4444' : '#8b5cf6'} /> 
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Jobs by Applicant Volume */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <FileText className="mr-2 text-violet-600" size={20} /> Top Jobs by Applicant Volume
            </h3>
            <div className="space-y-0">
              {stats.topJobs.map((job, idx) => (
                <div key={idx} className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-2 rounded-lg cursor-pointer" onClick={() => navigate('/jobs')}>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{job.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{job.department}</span>
                      <span className="text-xs font-medium text-emerald-600">• {job.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-800 block leading-none">{job.count}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applicants</span>
                  </div>
                </div>
              ))}
              {stats.topJobs.length === 0 && <p className="text-slate-500 text-center py-4">No job data available.</p>}
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          
          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Activity className="mr-2 text-violet-600" size={20} /> Recent Activity
            </h3>
            <div className="relative border-l border-slate-200 ml-3 space-y-6">
              {stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${activity.action.includes('hired') ? 'bg-emerald-500' : activity.action.includes('rejected') ? 'bg-red-500' : 'bg-violet-500'}`}></span>
                  <p className="text-sm text-slate-700 leading-tight">
                    <span className="font-bold text-slate-900">{activity.candidateName}</span> {activity.action}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{activity.candidateName} • {activity.role} <br/> {activity.time}</p>
                </div>
              ))}
              {stats.recentActivity.length === 0 && <p className="text-slate-500 pl-6">No recent activity.</p>}
            </div>
          </div>

          {/* AI Bias Audit */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
              <ShieldAlert className="mr-2 text-amber-500" size={20} /> AI Bias Audit
            </h3>
            <p className="text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">Claude architecture self-critique.</p>

            {!auditReport ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                <button 
                  onClick={fetchBiasAudit}
                  disabled={loadingAudit}
                  className="bg-violet-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-violet-700 transition-colors shadow-sm flex items-center disabled:opacity-70 text-sm"
                >
                  {loadingAudit ? <Loader2 className="animate-spin mr-2" size={18} /> : <ShieldAlert className="mr-2" size={18} />}
                  {loadingAudit ? 'Running Analysis...' : 'Run Bias Audit'}
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 text-sm pr-2 max-h-64 custom-scrollbar">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fairness Score</span>
                  <span className={`text-xl font-bold ${auditReport.overallBiasScore > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {auditReport.overallBiasScore}/100
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Analysis</span>
                  <p className="text-slate-700 text-xs leading-relaxed">{auditReport.genderBiasAnalysis}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;