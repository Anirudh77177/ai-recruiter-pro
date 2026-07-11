// 1. ENVIRONMENT VARIABLES load karo (Ye line sabse upar honi chahiye)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // DB import
const aiRoutes = require('./routes/aiRoutes');
const jobRoutes = require('./routes/jobRoutes');

// Connect to Database
connectDB(); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/jobs', jobRoutes);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'AI Recruiter Backend is running smoothly! 🚀' 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});