import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';

const CreateJobModal = ({ isOpen, onClose, onJobCreated }) => {
  // formData mein requiredSkills add kar diya hai
  const [formData, setFormData] = useState({ 
    title: '', 
    department: '', 
    location: '', 
    type: 'Full-time', 
    status: 'Active',
    requiredSkills: '' 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Skills string ko comma se split karke array mein convert kar rahe hain
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills 
          ? formData.requiredSkills.split(',').map(skill => skill.trim()) 
          : []
      };

      await axios.post('http://localhost:5000/api/jobs', payload);
      onJobCreated(); // Refresh list
      onClose(); // Close modal
    } catch (err) {
      alert("Failed to create job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Create New Job Posting</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" 
            placeholder="Job Title (e.g. Senior Frontend)" 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            required 
          />
          <input 
            className="w-full border border-slate-300 p-3 rounded-lg" 
            placeholder="Department" 
            onChange={(e) => setFormData({...formData, department: e.target.value})} 
          />
          <input 
            className="w-full border border-slate-300 p-3 rounded-lg" 
            placeholder="Location" 
            onChange={(e) => setFormData({...formData, location: e.target.value})} 
          />
          
          {/* Naya Skills Input */}
          <input 
            className="w-full border border-slate-300 p-3 rounded-lg" 
            placeholder="Required Skills (comma separated: React, Node, AWS)" 
            onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} 
          />

          <select 
            className="w-full border border-slate-300 p-3 rounded-lg" 
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>

          <button 
            type="submit" 
            className="w-full bg-violet-600 text-white py-3 rounded-lg font-bold hover:bg-violet-700 transition-colors flex justify-center"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Job"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;