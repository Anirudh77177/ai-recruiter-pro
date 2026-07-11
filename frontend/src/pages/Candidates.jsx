import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Upload, FileText, Loader2, ArrowRight, X } from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // Naya state: tab filter ke liye
  const navigate = useNavigate();

  // Upload Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadRole, setUploadRole] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ai/candidates');
      setCandidates(res.data.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic: Filter candidates based on selected tab
  const filteredCandidates = filter === 'all' 
    ? candidates 
    : candidates.filter(c => c.status === filter);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile || !uploadRole) {
      alert("Please provide both a PDF file and a Target Role.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', pdfFile);
    formData.append('role', uploadRole);

    try {
      await axios.post('http://localhost:5000/api/ai/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Resume successfully parsed!");
      setIsUploadOpen(false);
      setPdfFile(null);
      setUploadRole('');
      fetchCandidates();
    } catch (error) {
      alert("Failed to upload and parse resume.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center mb-2">
            <Users className="text-violet-600 mr-3" size={32} /> Candidates Database
          </h1>
          <p className="text-slate-500">Manage applicants, track status, and view AI screening results.</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center"
        >
          <Upload className="mr-2" size={20} /> Upload Resume
        </button>
      </div>

      {/* Tabs / Filter Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-lg w-max">
        {['all', 'applied', 'shortlisted', 'scheduled', 'hired', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${
              filter === status 
              ? 'bg-white text-violet-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Candidate Name</th>
              <th className="p-4">Applied Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">AI Score</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => (
                <tr key={candidate._id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{candidate.name}</p>
                    <p className="text-xs text-slate-500">{candidate.email}</p>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{candidate.roleApplied}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border ${
                      candidate.status === 'hired' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      candidate.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      candidate.status === 'shortlisted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {candidate.aiScore > 0 ? (
                      <span className={`font-bold ${candidate.aiScore >= 75 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {candidate.aiScore}%
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/candidates/${candidate._id}`)}
                      className="text-sm font-bold text-violet-600 hover:text-violet-800 flex items-center justify-end w-full"
                    >
                      View <ArrowRight size={16} className="ml-1" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No candidates found for this status.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <FileText className="mr-2 text-emerald-600" size={20} /> Upload Resume
              </h2>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Target Role</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Frontend Developer" 
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  value={uploadRole}
                  onChange={(e) => setUploadRole(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select PDF Resume</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${pdfFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}`}
                >
                  <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  {pdfFile ? (
                    <div>
                      <FileText className="mx-auto text-emerald-500 mb-2" size={32} />
                      <p className="text-sm font-bold text-emerald-700">{pdfFile.name}</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-sm font-medium text-slate-600">Click to upload PDF</p>
                    </div>
                  )}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center shadow-sm disabled:opacity-70"
              >
                {isUploading ? <Loader2 className="animate-spin mr-2" size={20} /> : "Parse & Upload"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;