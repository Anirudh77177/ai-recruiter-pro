const nodemailer = require('nodemailer');

// Debugging: Terminal pe check karo ki env variables load hue ya nahi
console.log("DEBUG - Email User:", process.env.EMAIL_USER);
console.log("DEBUG - Email Pass:", process.env.EMAIL_PASS ? "********" : "NOT LOADED");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log("✅ Email sent successfully!");
    } catch (error) {
        console.error("❌ Email Error:", error);
    }
};

module.exports = { sendEmail };