import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Building2, MapPin, Clock, DollarSign, Loader2, Trash2, Edit, Save, X } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  
  // New States for Inline Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const jobRes = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(jobRes.data.data);
      setEditData(jobRes.data.data); // Initialize edit data
      
      const candRes = await axios.get('http://localhost:5000/api/ai/candidates');
      const matchedCandidates = candRes.data.data.filter(c => c.roleApplied === jobRes.data.data.title);
      setCandidates(matchedCandidates);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if(window.confirm("Are you sure you want to delete this job?")) {
      await axios.delete(`http://localhost:5000/api/jobs/${id}`);
      navigate('/jobs');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/jobs/${id}`, editData);
      setJob(res.data.data);
      setIsEditing(false);
      alert("Job updated successfully!");
    } catch (err) {
      alert("Failed to update job.");
    }
  };

  const handleCancelEdit = () => {
    setEditData(job); // Reset to original
    setIsEditing(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
  if (!job) return <div>Job not found</div>;

  const pipeline = {
    total: candidates.length,
    applied: candidates.filter(c => c.status === 'applied').length,
    interviewing: candidates.filter(c => c.status === 'shortlisted').length,
    screening: candidates.filter(c => !c.aiScore).length || 0,
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button onClick={() => navigate('/jobs')} className="p-2 mr-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          
          {isEditing ? (
             <input className="text-3xl font-bold text-slate-900 border-b-2 border-violet-500 outline-none w-full" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} />
          ) : (
            <>
              <h1 className="text-3xl font-bold text-slate-900 mr-4">{job.title}</h1>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-emerald-200">
                {job.status}
              </span>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button onClick={handleCancelEdit} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 flex items-center"><X size={18} className="mr-2" /> Cancel</button>
              <button onClick={handleSaveEdit} className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center shadow-sm"><Save size={18} className="mr-2" /> Save Changes</button>
            </>
          ) : (
            <>
              <button onClick={handleDelete} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center border border-red-200">
                <Trash2 size={18} className="mr-2" /> Delete
              </button>
              <button onClick={() => setIsEditing(true)} className="bg-violet-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors flex items-center shadow-sm">
                <Edit size={18} className="mr-2" /> Edit Job
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
            {isEditing ? (
               <div className="flex flex-wrap gap-4 mb-8">
                 <input className="border p-2 rounded w-40" value={editData.department} onChange={(e) => setEditData({...editData, department: e.target.value})} />
                 <input className="border p-2 rounded w-40" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} />
                 <input className="border p-2 rounded w-40" value={editData.type} onChange={(e) => setEditData({...editData, type: e.target.value})} />
                 <input className="border p-2 rounded w-40" value={editData.salary} onChange={(e) => setEditData({...editData, salary: e.target.value})} />
               </div>
            ) : (
              <div className="flex flex-wrap gap-4 mb-8">
                <span className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100"><Building2 size={16} className="mr-2 text-slate-400" /> {job.department}</span>
                <span className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100"><MapPin size={16} className="mr-2 text-slate-400" /> {job.location}</span>
                <span className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100"><Clock size={16} className="mr-2 text-slate-400" /> {job.type}</span>
                <span className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100"><DollarSign size={16} className="mr-2 text-slate-400" /> {job.salary}</span>
              </div>
            )}

            <div className="flex border-b border-slate-200 mb-6">
              <button onClick={() => setActiveTab('description')} className={`pb-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'description' ? 'border-b-2 border-violet-600 text-violet-600' : 'text-slate-500 hover:text-slate-700'}`}>Job Description</button>
              <button onClick={() => setActiveTab('requirements')} className={`pb-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'requirements' ? 'border-b-2 border-violet-600 text-violet-600' : 'text-slate-500 hover:text-slate-700'}`}>Requirements</button>
            </div>
            
            <div className="text-slate-700 text-sm leading-relaxed">
              {isEditing ? (
                 <textarea className="w-full h-40 border p-3 rounded" value={activeTab === 'description' ? editData.description : editData.requirements} onChange={(e) => activeTab === 'description' ? setEditData({...editData, description: e.target.value}) : setEditData({...editData, requirements: e.target.value})} />
              ) : (
                activeTab === 'description' ? job.description : job.requirements
              )}
            </div>
          </div>

          {/* Candidates Table (Kept as is) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Candidates</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">ATS Score</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr key={candidate._id} className="border-b">
                    <td className="p-4 font-bold">{candidate.name}</td>
                    <td className="p-4 text-slate-600">{candidate.email}</td>
                    <td className="p-4"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{candidate.status}</span></td>
                    <td className="p-4 text-right">{candidate.aiScore ? `${candidate.aiScore}%` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Pipeline Box (Kept as is) */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Pipeline</h3>
            <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center mb-6 border border-slate-100">
              <span className="text-4xl font-black text-violet-600 mb-1">{pipeline.total}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;