const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Get All Jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.status(200).json({ data: jobs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Job
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        res.status(200).json({ data: job });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create A Single Job (NEW: Jo tu modal se bhejega)
router.post('/', async (req, res) => {
    try {
        // req.body mein se direct data lo aur save karo
        const newJob = new Job(req.body);
        await newJob.save();
        res.status(201).json({ message: 'Job created successfully!', data: newJob });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Seed Real Jobs (Existing)
router.post('/seed', async (req, res) => {
    try {
        await Job.deleteMany({});
        const newJobs = await Job.insertMany([
            { title: 'Product Manager', department: 'Product', location: 'San Francisco, CA', type: 'Full Time', salary: '$130k - $175k', description: 'We are looking for a Senior Product Manager...', requirements: '5+ years experience...' },
            { title: 'Senior Software Engineer', department: 'Engineering', location: 'Remote', type: 'Full Time', salary: '$140k - $180k', description: 'Join our core backend team...', requirements: 'Expertise in MERN stack.' }
        ]);
        res.status(201).json({ message: 'Real Jobs Seeded!', data: newJobs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Job
router.delete('/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Edit Job
router.put('/:id', async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ data: updatedJob });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;