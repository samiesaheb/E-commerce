import type { RequestHandler } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import 'dotenv/config';

// Ensure environment variables are loaded and valid
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
    throw new Error('Email configuration is missing. Please set EMAIL_USER and EMAIL_PASS in your .env file.');
}

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,  // Your Gmail address from .env
        pass: emailPass   // Your Gmail App Password from .env
    }
});

export const POST: RequestHandler = async ({ request }) => {
    try {
        // Get form data from the request
        const { name, email, subject, message } = await request.json();

        // Validate data
        if (!name || !email || !subject || !message) {
            return new Response(JSON.stringify({ error: 'All fields are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Email options
        const mailOptions = {
            from: `"${name}" <${email}>`,       // Sender's name and email from form
            to: 'samie@skyhigh.co.th',          // Recipient email
            replyTo: email,                     // Allow replies to go to the sender
            subject: `Contact Form: ${subject}`,
            text: `
                Name: ${name}
                Email: ${email}
                Subject: ${subject}
                Message: ${message}
            `,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        // Send the email and log the result
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        // Return success response
        return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ error: 'Failed to send message', details: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};