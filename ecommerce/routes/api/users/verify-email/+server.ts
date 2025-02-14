import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Configure the mail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // ✅ Your email (Gmail)
        pass: process.env.EMAIL_PASS  // ✅ Your app password (not regular email password)
    }
});

// ✅ Function to send emails
export async function sendEmail(to: string, subject: string, html: string) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });
    } catch (error) {
        console.error("Email Sending Error:", error);
    }
}

// ✅ Function to send email verification
export async function sendVerificationEmail(email: string, verificationLink: string) {
    const subject = "Verify Your Email";
    const html = `
        <h2>Welcome to Sky High International Co., Ltd.!</h2>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}" style="padding:10px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
    `;
    await sendEmail(email, subject, html);
}
