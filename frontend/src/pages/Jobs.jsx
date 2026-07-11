import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, MapPin, Clock, Plus, Loader2 } from 'lucide-react';
import CreateJobModal from '../components/CreateJobModal'; // Import modal

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/jobs');
      setJobs(response.data.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="max-w-7xl pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Briefcase className="mr-3 text-violet-600" size={32} /> Active Postings
          </h1>
          <p className="text-slate-500 mt-1">Manage open roles and track candidate pipelines.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} // Modal open karega
          className="bg-violet-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-violet-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="mr-2" size={20} /> Create New Job
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 cursor-pointer group">
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-violet-600 transition-colors">{job.title}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1 mb-4">{job.department}</p>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md"><MapPin size={14} className="mr-1.5 text-slate-400" /> {job.location}</span>
                <span className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md"><Clock size={14} className="mr-1.5 text-slate-400" /> {job.type}</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase">{job.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Integration */}
      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onJobCreated={fetchJobs} 
      />
    </div>
  );
};

export default Jobs;