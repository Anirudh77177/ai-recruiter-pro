import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AudioRecorder from '../components/AudioRecorder';
import { Mic, Save, ArrowLeft, Loader2 } from 'lucide-react';

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    const res = await axios.get(`http://localhost:5000/api/ai/candidates/${id}`);
    setCandidate(res.data.data);
    setLoading(false);
  };

  const handleAudioUpload = async (blob) => {
    const formData = new FormData();
    formData.append('audio', blob, 'interview.webm');
    
    // Transcribe
    const res = await axios.post('http://localhost:5000/api/ai/transcribe', formData);
    setTranscript(res.data.transcript);
  };

  const saveInterview = async () => {
    await axios.put(`http://localhost:5000/api/ai/candidates/${id}/save-transcript`, { transcript });
    alert("Interview Transcript Saved Successfully!");
    navigate(`/candidates/${id}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-slate-500"><ArrowLeft size={16} className="mr-2" /> Back</button>
      
      <div className="bg-white p-8 rounded-xl border shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Interview Room: {candidate.name}</h1>
        <p className="text-slate-500 mb-6">{candidate.roleApplied}</p>

        <AudioRecorder onUpload={handleAudioUpload} />

        {transcript && (
          <div className="mt-8">
            <h3 className="font-bold mb-2">Generated Transcript:</h3>
            <textarea 
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-60 p-4 border rounded-lg bg-slate-50"
            />
            <button onClick={saveInterview} className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">
              <Save className="inline mr-2" size={18} /> Save Transcript to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewRoom;