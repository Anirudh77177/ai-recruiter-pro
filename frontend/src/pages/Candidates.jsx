import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 IMPORT YEH
import axios from 'axios';
import { Mail, MapPin, Briefcase, Award, Loader2, ChevronRight } from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 👈 HOOK INITIALIZE

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ai/candidates');
        setCandidates(response.data.data);
      } catch (error) {
        console.error("Failed to fetch candidates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'shortlisted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl pb-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Global Talent Pool</h1>
          <p className="text-slate-500 mt-1">AI-screened candidate database.</p>
        </div>
        <button className="bg-violet-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-violet-700 transition-colors shadow-sm">
          + Add Candidate
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-violet-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{candidate.name}</h3>
                    <p className="text-sm font-medium text-violet-600">{candidate.roleApplied}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center"><Mail size={16} className="mr-2 text-slate-400" /> {candidate.email}</div>
                  <div className="flex items-center"><Briefcase size={16} className="mr-2 text-slate-400" /> {candidate.yearsOfExperience} years exp.</div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 flex-1 flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Score</span>
                  <span className="text-lg font-bold text-slate-800">{candidate.aiScore > 0 ? `${candidate.aiScore}/100` : 'Pending'}</span>
                </div>

                <div className="mt-auto pt-4">
                  {/* 👇 YAHAN HAI FIX: Button click pe navigate karega 👇 */}
                  <button 
                    onClick={() => navigate(`/candidates/${candidate._id}`)}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-violet-600 hover:text-white transition-colors flex items-center justify-center"
                  >
                    View Full Profile <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;