const express = require('express');
const axios = require('axios');
const router = express.Router();
const Candidate = require('../models/Candidate');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { sendEmail } = require('../services/emailService');
const {
    generateSyntheticCVs,
    scoreCandidateCV,
    generateInterviewBank,
    runBiasAudit,
    parseResumeToJSON,
    analyzePersonality,
    analyzeATS
} = require('../services/aiService');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const upload = multer({ storage: multer.memoryStorage() });

// --- UPLOAD RESUME ROUTE ---
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.trim() === "") {
            return res.status(400).json({ message: "Could not extract text." });
        }

        const parsedData = await parseResumeToJSON(resumeText);

        // Skills Sanitization
        let normalizedSkills = [];
        if (Array.isArray(parsedData.skills)) {
            normalizedSkills = parsedData.skills;
        } else if (typeof parsedData.skills === 'object' && parsedData.skills !== null) {
            normalizedSkills = Object.values(parsedData.skills).flat();
        }

        // Education Sanitization
        let educationString = "Not specified";
        if (Array.isArray(parsedData.education)) {
            educationString = parsedData.education.map(edu =>
                `${edu.degree || 'Degree'} at ${edu.institution || 'Institution'}`.trim()
            ).join(', ');
        } else if (typeof parsedData.education === 'object' && parsedData.education !== null) {
            educationString = `${parsedData.education.degree || 'Degree'} at ${parsedData.education.institution || 'Institution'}`.trim();
        } else if (typeof parsedData.education === 'string') {
            educationString = parsedData.education;
        }

        const newCandidate = new Candidate({
            name: parsedData.name || "Unknown Candidate",
            email: parsedData.email || "no-email@provided.com",
            roleApplied: req.body.role || "General Application",
            yearsOfExperience: parsedData.yearsOfExperience || 0,
            education: educationString,
            skills: normalizedSkills,
            careerTrajectory: resumeText,
            parsedResume: parsedData,
            status: 'applied'
        });

        await newCandidate.save();
        res.status(201).json({ message: "Resume parsed successfully!", data: newCandidate });

    } catch (error) {
        console.error("🔥 PDF Parse Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- STATUS UPDATE ROUTE (With Email & No Warnings) ---
router.put('/candidates/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' } 
        );

        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        if (status === 'rejected') {
            await sendEmail(candidate.email, "Update on your application", `Hi ${candidate.name}, Thank you for applying to ${candidate.roleApplied}. We regret to inform you that we are not moving forward with your application.`);
        } else if (status === 'hired') {
            await sendEmail(candidate.email, "Congratulations!", `Hi ${candidate.name}, You have been hired for the ${candidate.roleApplied} position! Welcome aboard.`);
        }

        res.status(200).json({ data: candidate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SCHEDULE INTERVIEW ROUTE (With Email & No Warnings) ---
router.put('/candidates/:id/schedule', async (req, res) => {
    try {
        const { interviewDate, interviewTime } = req.body;
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { interviewDate, interviewTime, status: 'scheduled' },
            { returnDocument: 'after' }
        );

        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        await sendEmail(
            candidate.email,
            "Interview Scheduled - HireSense",
            `Hi ${candidate.name},\n\nYour interview for the role of ${candidate.roleApplied} is scheduled on ${interviewDate} at ${interviewTime}.\n\nBest of luck!`
        );

        res.status(200).json({ data: candidate, message: "Interview Scheduled & Email Sent!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- OTHER EXISTING ROUTES ---
router.get('/check-models', async (req, res) => {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/seed-cvs', async (req, res) => {
    try {
        const newCVs = await generateSyntheticCVs(req.body.role);
        const insertedCVs = await Candidate.insertMany(newCVs);
        res.status(201).json({ message: "CVs Generated!", data: insertedCVs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/score-cvs', async (req, res) => {
    try {
        const candidates = await Candidate.find({ status: 'applied' }).limit(5);
        if (candidates.length === 0) return res.status(404).json({ message: "No new candidates to score." });

        let updatedCandidates = [];
        for (let candidate of candidates) {
            const evaluation = await scoreCandidateCV(candidate, candidate.roleApplied);
            candidate.aiScore = evaluation.aiScore;
            candidate.screeningFeedback = evaluation.screeningFeedback;
            candidate.status = evaluation.aiScore > 75 ? 'shortlisted' : 'rejected';
            await candidate.save();
            updatedCandidates.push(candidate);
            await delay(2500);
        }
        res.status(200).json({ message: "CVs Scored!", data: updatedCandidates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generate-interview', async (req, res) => {
    try {
        const interviewBank = await generateInterviewBank(req.body.role);
        res.status(200).json({ message: "Interview Bank Generated!", data: interviewBank });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/bias-audit', async (req, res) => {
    try {
        const candidates = await Candidate.find({ status: { $in: ['shortlisted', 'rejected'] } });
        if (candidates.length === 0) return res.status(400).json({ message: "Not enough data for audit." });
        const auditReport = await runBiasAudit(candidates);
        res.status(200).json({ message: "Bias Audit Completed", data: auditReport });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/candidates', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ createdAt: -1 });
        res.status(200).json({ data: candidates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/candidates/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        res.status(200).json({ data: candidate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/parse-resume/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        if (candidate.parsedResume && Object.keys(candidate.parsedResume).length > 0) {
            return res.status(200).json({ data: candidate });
        }

        const textToParse = req.body.resumeText || candidate.careerTrajectory;
        if (!textToParse) return res.status(400).json({ message: "No text to parse." });

        const parsedData = await parseResumeToJSON(textToParse);
        candidate.parsedResume = parsedData;
        await candidate.save();
        res.status(200).json({ data: candidate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/candidates/:id/notes', async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { recruiterNotes: req.body.notes },
            { returnDocument: 'after' }
        );
        res.status(200).json({ data: candidate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/analyze/personality/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        const personalityData = await analyzePersonality(candidate.careerTrajectory);
        res.status(200).json({ data: personalityData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/analyze/ats/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        const atsData = await analyzeATS(candidate.careerTrajectory, candidate.roleApplied);
        res.status(200).json({ data: atsData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/list-available-models', async (req, res) => {
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const modelNames = response.data.models.map(m => m.name);
        res.json({ availableModels: modelNames });
    } catch (error) {
        res.status(500).json({ error: "Could not fetch models: " + error.message });
    }
});

module.exports = router;