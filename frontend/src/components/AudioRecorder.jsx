import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Send } from 'lucide-react';

const AudioRecorder = ({ onUpload }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [mediaBlob, setMediaBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    chunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    
    mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setMediaBlob(blob);
      setAudioURL(URL.createObjectURL(blob));
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Record Interview Audio</h3>
      
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button onClick={startRecording} className="flex items-center bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 font-bold">
            <Mic className="mr-2" size={20} /> Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold animate-pulse">
            <Square className="mr-2" size={20} /> Stop Recording
          </button>
        )}

        {audioURL && (
          <audio src={audioURL} controls className="h-10" />
        )}
        
        {mediaBlob && (
          <button onClick={() => onUpload(mediaBlob)} className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-bold">
            <Send className="mr-2" size={20} /> Process Transcript
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;