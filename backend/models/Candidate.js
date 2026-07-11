const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    roleApplied: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true },
    education: { type: String, required: true },
    skills: [String],
    careerTrajectory: { type: String }, 
    aiScore: { type: Number, default: 0 }, 
    screeningFeedback: { type: String, default: "" }, 
    status: { 
        type: String, 
        // 'scheduled' aur 'hired' add kiya hai database validation error se bachne ke liye
        enum: ['applied', 'screened', 'shortlisted', 'scheduled', 'interviewed', 'offered', 'hired', 'rejected'],
        default: 'applied' 
    },
    
    // Naye fields for Pro-Dashboard
    parsedResume: { type: Object, default: null }, 
    recruiterNotes: { type: String, default: "" },
    biasAuditResults: { type: Object, default: null },

    // Naye fields for Interview Scheduling
    interviewDate: { type: String, default: null },
    interviewTime: { type: String, default: null }

}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);