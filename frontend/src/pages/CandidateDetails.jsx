import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, BrainCircuit, ShieldCheck, MessageSquare, ArrowLeft, Save, Activity, BarChart3, Users, CheckCircle, XCircle, Mic } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import AudioRecorder from '../components/AudioRecorder'; // Import updated here

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [analysisData, setAnalysisData] = useState({ ats: null, personality: null, bias: null });
  const [transcript, setTranscript] = useState(null); // Added for transcript display

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/ai/candidates/${id}`);
      setCandidate(res.data.data);
      setNotes(res.data.data.recruiterNotes || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Handle Audio Transcription
  const handleAudioUpload = async (blob) => {
    const formData = new FormData();
    formData.append('audio', blob, 'interview.webm');
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/ai/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTranscript(res.data.transcript);
      alert("Transcript generated successfully!");
    } catch (error) {
      alert("Transcription failed.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const runATS = async () => {
    setLoading(true);
    const res = await axios.post(`http://localhost:5000/api/ai/analyze/ats/${id}`);
    setAnalysisData(prev => ({ ...prev, ats: res.data.data }));
    setLoading(false);
  };

  const runPersonality = async () => {
    setLoading(true);
    const res = await axios.post(`http://localhost:5000/api/ai/analyze/personality/${id}`);
    setAnalysisData(prev => ({ ...prev, personality: res.data.data }));
    setLoading(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this candidate as ${newStatus}?`)) return;
    
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/ai/candidates/${id}/status`, { status: newStatus });
      setCandidate(prev => ({ ...prev, status: newStatus }));
      alert(`Candidate successfully marked as ${newStatus.toUpperCase()}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update candidate status.");
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    await axios.put(`http://localhost:5000/api/ai/candidates/${id}/notes`, { notes });
    alert("Notes saved!");
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;
  if (!candidate) return <div className="flex h-screen items-center justify-center font-bold text-xl">Candidate not found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft size={20}/></button>
          <h1 className="text-3xl font-bold text-slate-800">{candidate.name}</h1>
          <span className={`ml-4 px-3 py-1 rounded-full font-bold uppercase text-xs border ${
            candidate.status === 'hired' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
            candidate.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
            'bg-violet-100 text-violet-700 border-violet-200'
          }`}>
            {candidate.status}
          </span>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => handleStatusUpdate('rejected')} className="flex items-center bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors border border-red-200 shadow-sm">
            <XCircle size={18} className="mr-2"/> Reject
          </button>
          <button onClick={() => handleStatusUpdate('hired')} className="flex items-center bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm">
            <CheckCircle size={18} className="mr-2"/> Mark as Hired
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        {['Overview', 'ATS Score', 'Personality', 'Bias Check'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 ${activeTab === tab ? 'border-b-2 border-violet-600 font-bold text-violet-600' : 'text-slate-500 hover:text-slate-700 transition-colors'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          
          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Parse Resume Section */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="flex items-center font-bold mb-4 text-slate-800"><BrainCircuit className="mr-2 text-violet-600" /> AI Resume Analysis</h2>
                {candidate.parsedResume ? (
                  <pre className="bg-slate-50 p-4 rounded text-sm overflow-x-auto text-slate-700 border border-slate-100">{JSON.stringify(candidate.parsedResume, null, 2)}</pre>
                ) : (
                  <div className="flex justify-center p-6">
                    <button onClick={() => axios.post(`http://localhost:5000/api/ai/parse-resume/${id}`, { resumeText: candidate.careerTrajectory }).then(res => setCandidate(res.data.data))} className="bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 transition shadow-sm">Parse Resume</button>
                  </div>
                )}
              </div>

              {/* Interview Recording Section */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="flex items-center font-bold mb-4 text-slate-800"><Mic className="mr-2 text-violet-600" /> Live Interview Transcription</h2>
                <AudioRecorder onUpload={handleAudioUpload} />
                {transcript && (
                  <div className="mt-4 p-4 bg-slate-50 border rounded-lg">
                    <h4 className="font-bold mb-2">Interview Transcript:</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{transcript}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATS Score Tab */}
          {activeTab === 'ATS Score' && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              {!analysisData.ats ? (
                <button onClick={runATS} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm">Run ATS Analysis</button>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-4">ATS Compatibility: <span className="text-emerald-600">{analysisData.ats.score}/100</span></h2>
                  <p className="mb-4 font-medium text-slate-600">Grade: {analysisData.ats.grade}</p>
                  <div className="flex gap-2 flex-wrap">
                    {analysisData.ats.matched.map(skill => <span key={skill} className="bg-emerald-50 px-3 py-1 rounded-md text-emerald-700 text-sm border border-emerald-100 font-medium">{skill}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Personality Tab */}
          {activeTab === 'Personality' && (
            <div className="bg-white p-6 rounded-lg border shadow-sm h-96">
              {!analysisData.personality ? (
                <button onClick={runPersonality} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">Run Personality Audit</button>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={Object.entries(analysisData.personality.personality).map(([k,v]) => ({ subject: k, A: v }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} />
                    <Radar name="Traits" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

        {/* Recruiter Notes Sidebar */}
        <div className="bg-white p-6 rounded-lg border shadow-sm h-fit sticky top-6">
          <h3 className="font-bold mb-4 flex items-center text-slate-800"><MessageSquare className="mr-2 text-violet-600" size={18}/> Recruiter Notes</h3>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Add internal notes about this candidate..."
            className="w-full h-40 border border-slate-200 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-violet-500 outline-none resize-none text-sm" 
          />
          <button onClick={saveNotes} className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition shadow-sm flex items-center justify-center">
            <Save size={18} className="mr-2" /> Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;