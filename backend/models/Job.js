const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String, default: 'Engineering' },
    location: { type: String, default: 'Remote' },
    type: { type: String, default: 'Full Time' },
    salary: { type: String, default: '$100k - $150k' },
    description: { type: String, default: 'We are looking for a rockstar to join our team.' },
    requirements: { type: String, default: 'Minimum 3 years of experience in relevant stack.' },
    // Naya field add kar de agar baad mein "Skill Matching" chahiye
    requiredSkills: [{ type: String }], 
    status: { type: String, enum: ['Active', 'Paused', 'Closed'], default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);