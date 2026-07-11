const { GoogleGenerativeAI } = require('@google/generative-ai');

const callGemini = async (prompt) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // BINGO! Tere list mein 'gemini-2.5-flash' available hai, yahi use karenge
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        
        const result = await model.generateContent(prompt);
        let rawData = result.response.text();
        
        // Clean markdown and extra characters
        return rawData.replace(/```json/g, '').replace(/```/g, '').trim();
    } catch (error) {
        console.error("❌ Gemini SDK Error:", error.message);
        throw new Error("Failed to generate content: " + error.message);
    }
};

// Core Functions
const generateSyntheticCVs = async (role) => {
    const prompt = `Generate 5 diverse synthetic CVs for ${role}. Return ONLY JSON array: [{ name, email, roleApplied, yearsOfExperience, education, skills, careerTrajectory }]. No markdown.`;
    return JSON.parse(await callGemini(prompt));
};

const scoreCandidateCV = async (candidateInfo, role) => {
    const prompt = `Review this candidate for ${role}: ${JSON.stringify(candidateInfo)}. Return ONLY JSON: { "aiScore": number, "screeningFeedback": string }. No markdown.`;
    return JSON.parse(await callGemini(prompt));
};

const runBiasAudit = async (candidatesList) => {
    const prompt = `Audit these candidates for bias: ${JSON.stringify(candidatesList)}. Return ONLY JSON: { "overallBiasScore": number, "genderBiasAnalysis": string, "ageBiasAnalysis": string, "educationalBiasAnalysis": string, "structuralImprovements": array }. No markdown.`;
    return JSON.parse(await callGemini(prompt));
};

const parseResumeToJSON = async (rawText) => {
    // 2.5-flash bahut smart hai, ye text se JSON nikaal lega
    const prompt = `Parse the following resume text into a structured JSON object with keys: name, email, phone, education, summary, skills. Resume text: ${rawText}. Return ONLY JSON. No markdown.`;
    return JSON.parse(await callGemini(prompt));
};

const analyzePersonality = async (resumeText) => {
    const prompt = `Analyze this resume and predict OCEAN traits. Return ONLY JSON: { "personality": { "Openness": number, "Conscientiousness": number, "Extraversion": number, "Agreeableness": number, "Neuroticism": number }, "summary": string, "cultureFit": number, "communication": string }. No markdown.`;
    return JSON.parse(await callGemini(prompt));
};

const analyzeATS = async (resumeText, role) => {
    const prompt = `Analyze resume for ${role}: ${resumeText}. Return JSON: { "score": number, "grade": string, "matched": array, "missing": array }. No markdown.`;
    return JSON.parse(await callGemini(prompt));
};

// 👉 YE HAI MISSING FUNCTION JO MAINE ADD KIYA HAI 👈
const generateInterviewBank = async (role) => {
    const prompt = `Act as an Expert Technical Recruiter. Generate a comprehensive interview question bank for the role of "${role}". Provide exactly 5 technical questions and 3 behavioral questions with brief expected answers. Format the output clearly as plain text with bullet points. Do not output JSON.`;
    // Yahan JSON.parse nahi lagaya kyunki humein plain text chahiye
    return await callGemini(prompt);
};

// Exports mein bhi isko add kar diya hai
module.exports = { 
    generateSyntheticCVs, 
    scoreCandidateCV, 
    runBiasAudit, 
    parseResumeToJSON,
    analyzePersonality,
    analyzeATS,
    generateInterviewBank
};