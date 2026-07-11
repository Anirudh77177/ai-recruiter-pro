import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, UploadCloud, Loader2, X } from 'lucide-react';

const CandidateJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs');
      setJobs(res.data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!file || !selectedJob) return alert("Please select a resume file.");
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', selectedJob.title);

    try {
      await axios.post('http://localhost:5000/api/ai/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Application Submitted Successfully!");
      setSelectedJob(null);
      setFile(null);
    } catch (error) {
      alert("Application failed. Please try again.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-slate-50">
      <h1 className="text-3xl font-bold mb-8 text-slate-800 flex items-center">
        <Briefcase className="mr-3 text-violet-600"/> Available Positions
      </h1>
      
      <div className="grid gap-6">
        {jobs.length > 0 ? jobs.map((job) => (
          <div key={job._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{job.title}</h2>
                <p className="text-slate-500 mb-4 mt-1">{job.description}</p>
                <span className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-xs font-bold uppercase border border-violet-100">{job.type}</span>
              </div>
              <button 
                onClick={() => setSelectedJob(job)}
                className="bg-violet-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-violet-700 transition shadow-sm"
              >
                Apply Now
              </button>
            </div>
          </div>
        )) : (
          <p className="text-center text-slate-500 py-20">No jobs currently available.</p>
        )}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Apply for {selectedJob.title}</h2>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            
            <label className="block mb-2 text-sm font-medium text-slate-700">Upload your Resume (PDF)</label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])} 
              className="w-full mb-6 border border-slate-300 p-2 rounded-lg text-sm" 
            />
            
            <button 
              onClick={handleApply} 
              disabled={isUploading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center shadow-md disabled:opacity-70"
            >
              {isUploading ? <Loader2 className="animate-spin mr-2" size={20} /> : <UploadCloud className="mr-2" size={20} />}
              {isUploading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;