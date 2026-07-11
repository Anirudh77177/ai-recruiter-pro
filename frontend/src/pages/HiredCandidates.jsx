import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle, Briefcase, Mail, User } from 'lucide-react';

const HiredCandidates = () => {
  const [hiredList, setHiredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHired = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/ai/candidates');
        // Sirf hired candidates ko filter kar rahe hain
        const filtered = res.data.data.filter(c => c.status === 'hired');
        setHiredList(filtered);
      } catch (err) {
        console.error("Error fetching hired candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHired();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto p-8 pb-10">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => navigate('/dashboard')} className="p-2 mr-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <CheckCircle className="text-emerald-500 mr-3" size={32} /> 
            Hired Candidates
          </h1>
          <p className="text-slate-500 mt-1">These candidates have successfully cleared the process and are hired.</p>
        </div>
      </div>

      {/* Grid of Hired Candidates */}
      {hiredList.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center shadow-sm">
          <div className="mx-auto bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <User size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Hires Yet</h3>
          <p className="text-slate-500">When you mark a candidate as hired, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hiredList.map((candidate) => (
            <div key={candidate._id} className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Hired
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mr-4">
                  {candidate.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{candidate.name}</h3>
                  <p className="text-xs font-bold text-emerald-600">{candidate.aiScore}% Match</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                  <Briefcase size={16} className="mr-2 text-slate-400" /> {candidate.roleApplied}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Mail size={16} className="mr-2 text-slate-400" /> {candidate.email}
                </div>
              </div>

              <button 
                onClick={() => navigate(`/candidates/${candidate._id}`)}
                className="w-full bg-slate-50 text-slate-700 border border-slate-200 py-2 rounded-lg font-medium hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HiredCandidates;