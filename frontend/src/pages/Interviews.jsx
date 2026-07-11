import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, Clock, Search, X, Loader2, ArrowRight, Sparkles } from 'lucide-react';

const Interviews = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [scheduleData, setScheduleData] = useState({ date: "", time: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for AI Q&A Generator (Ye wapas add kiya hai)
  const [targetRole, setTargetRole] = useState("");
  const [qaBank, setQaBank] = useState(null);
  const [isGeneratingQA, setIsGeneratingQA] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/ai/candidates');
      setCandidates(res.data.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates for the search bar (excluding already hired/rejected)
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !['hired', 'rejected'].includes(c.status)
  );

  // Get only scheduled or interviewed candidates for the table
  const scheduledSessions = candidates.filter(c => ['scheduled', 'interviewed'].includes(c.status));

  // Handler: Schedule Interview
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !scheduleData.date || !scheduleData.time) {
      alert("Please select a candidate, date, and time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/ai/candidates/${selectedCandidate._id}/schedule`, {
        interviewDate: scheduleData.date,
        interviewTime: scheduleData.time
      });
      
      alert("Interview Scheduled Successfully!");
      setIsScheduleModalOpen(false);
      setSelectedCandidate(null);
      setScheduleData({ date: "", time: "" });
      fetchCandidates(); // Refresh the list
    } catch (error) {
      alert("Failed to schedule interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Generate Q&A Bank
  const handleGenerateQA = async () => {
    if (!targetRole.trim()) {
      alert("Please enter a Target Role first.");
      return;
    }
    
    setIsGeneratingQA(true);
    setQaBank(null); // Clear previous results
    try {
      const res = await axios.post('http://localhost:5000/api/ai/generate-interview', { role: targetRole });
      setQaBank(res.data.data); // Save generated response
    } catch (error) {
      console.error("Error generating Q&A:", error);
      alert("Failed to generate Q&A Bank. Check console.");
    } finally {
      setIsGeneratingQA(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* AI Interview Studio Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center mb-2">
          <Video className="text-violet-600 mr-3" size={32} /> AI Interview Studio
        </h1>
        <p className="text-slate-500 mb-6">Dynamically generated question banks and evaluation rubrics.</p>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">Target Role</label>
              <input 
                type="text" 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Product Manager, Full Stack Developer" 
                className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <button 
              onClick={handleGenerateQA}
              disabled={isGeneratingQA}
              className="bg-violet-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-violet-700 transition-colors shadow-sm flex items-center disabled:opacity-70"
            >
              {isGeneratingQA ? <Loader2 className="animate-spin mr-2" size={20} /> : <Sparkles className="mr-2" size={20} />}
              {isGeneratingQA ? 'Generating...' : 'Generate Q&A Bank'}
            </button>
          </div>

          {/* Display Generated Q&A Data */}
          {qaBank && (
            <div className="mt-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Generated Interview Guide</h3>
              <div className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-4 rounded border border-slate-200 max-h-96 overflow-y-auto">
                {typeof qaBank === 'string' ? qaBank : JSON.stringify(qaBank, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <Calendar className="mr-2 text-slate-500" size={20} /> Recent Sessions
          </h3>
          <button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors shadow-sm"
          >
            + Schedule Interview
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Candidate</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {scheduledSessions.map((session) => (
                <tr key={session._id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                  <td className="p-4 font-bold text-slate-800">
                    {session.name}
                    <span className="block text-xs text-slate-400 font-normal">#{session._id.slice(-6)}</span>
                  </td>
                  <td className="p-4 text-slate-600">{session.roleApplied}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border ${
                      session.status === 'interviewed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    {session.interviewDate ? `${session.interviewDate} at ${session.interviewTime}` : 'TBD'}
                  </td>
                  <td className="p-4 text-center font-bold text-emerald-600">
                    {session.aiScore ? `${session.aiScore}%` : '-'}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/candidates/${session._id}`)}
                      className="text-sm font-bold text-slate-600 hover:text-violet-600 flex items-center justify-end w-full group"
                    >
                      View <ArrowRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </td>
                </tr>
              ))}
              {scheduledSessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No scheduled interviews found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Schedule Interview</h2>
              <button onClick={() => { setIsScheduleModalOpen(false); setSelectedCandidate(null); }} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-md border"><X size={20}/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {!selectedCandidate ? (
                // Step 1: Search & Select Candidate
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Search Candidate</label>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Type name to search..." 
                      className="w-full border border-slate-300 pl-10 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                    {filteredCandidates.map(c => (
                      <div 
                        key={c._id} 
                        onClick={() => setSelectedCandidate(c)}
                        className="p-3 border-b border-slate-100 last:border-0 hover:bg-violet-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.roleApplied}</p>
                        </div>
                        <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-1 rounded">Select</span>
                      </div>
                    ))}
                    {filteredCandidates.length === 0 && <p className="p-4 text-center text-sm text-slate-500">No matching candidates found.</p>}
                  </div>
                </div>
              ) : (
                // Step 2: Pick Date & Time
                <form onSubmit={handleScheduleSubmit} className="space-y-5">
                  <div className="bg-violet-50 border border-violet-100 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Selected Candidate</p>
                      <p className="font-bold text-slate-800">{selectedCandidate.name}</p>
                      <p className="text-sm text-slate-600">{selectedCandidate.roleApplied}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedCandidate(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline">Change</button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input 
                        type="date" 
                        required
                        className="w-full border border-slate-300 pl-10 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                        value={scheduleData.date}
                        onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input 
                        type="time" 
                        required
                        className="w-full border border-slate-300 pl-10 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                        value={scheduleData.time}
                        onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-violet-600 text-white py-3 rounded-lg font-bold hover:bg-violet-700 transition-colors flex justify-center items-center mt-6 shadow-sm"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Confirm Schedule"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;