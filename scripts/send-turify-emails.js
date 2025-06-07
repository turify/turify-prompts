const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// Import Prisma Client for database operations
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Email configuration from environment variables
const EMAIL_CONFIG = {
  host: process.env.EMAIL_SERVER_HOST || 'email-smtp.us-west-2.amazonaws.com',
  port: process.env.EMAIL_SERVER_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  }
};

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Function to generate unsubscribe token
function generateUnsubscribeToken(email) {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret-change-in-production';
  return Buffer.from(email + secret).toString('base64');
}

// Function to generate unsubscribe URL
function generateUnsubscribeUrl(email, campaignType = 'early_access') {
  const token = generateUnsubscribeToken(email);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://turify.dev';
  return `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&campaign=${campaignType}&token=${encodeURIComponent(token)}`;
}

// HTML email template for Turify promotion
const createEmailHTML = (recipientEmail) => {
  const unsubscribeUrl = generateUnsubscribeUrl(recipientEmail);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Early Access: Turify - Free AI Prompt Generator</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #1a1a1a;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        .container {
            background: white;
            padding: 0;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            text-align: center;
            padding: 40px 45px 35px;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
        }
        .logo {
            font-size: 42px;
            font-weight: 800;
            color: white;
            margin-bottom: 8px;
            letter-spacing: -1px;
            position: relative;
            z-index: 1;
        }
        .tagline {
            color: rgba(255,255,255,0.9);
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        .early-access {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 8px 20px;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 25px;
            font-size: 12px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            position: relative;
            z-index: 1;
            backdrop-filter: blur(10px);
        }
        .content {
            padding: 50px 45px;
        }
        .headline {
            font-size: 32px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 25px;
            text-align: center;
            line-height: 1.2;
            background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .intro-text {
            font-size: 20px;
            margin-bottom: 40px;
            color: #475569;
            text-align: center;
            font-weight: 500;
        }
        .simple-box {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 40px;
            margin: 40px 0;
            border-radius: 16px;
            text-align: center;
            border: 1px solid #e2e8f0;
            position: relative;
        }
        .simple-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 16px 16px 0 0;
        }
        .simple-box h3 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 25px;
            color: #1e293b;
        }
        .simple-box p {
            font-size: 18px;
            margin: 0;
            color: #475569;
            line-height: 1.8;
        }
        .example {
            background: #f8fafc;
            padding: 35px;
            margin: 40px 0;
            border-radius: 16px;
            border: 2px solid #e2e8f0;
            position: relative;
        }
        .example::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 16px 16px 0 0;
        }
        .example-title {
            font-weight: 700;
            margin-bottom: 20px;
            color: #1e293b;
            font-size: 18px;
        }
        .example-content {
            margin: 20px 0;
        }
        .example-input {
            background: white;
            padding: 20px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            margin: 15px 0;
            font-style: italic;
            color: #64748b;
            font-size: 16px;
            position: relative;
        }
        .example-input::before {
            content: '💭';
            position: absolute;
            top: -10px;
            left: 15px;
            background: white;
            padding: 0 5px;
            font-size: 14px;
        }
        .example-output {
            background: white;
            padding: 25px;
            border: 2px solid #3b82f6;
            border-radius: 12px;
            margin: 15px 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 14px;
            line-height: 1.7;
            color: #1e293b;
            position: relative;
        }
        .example-output::before {
            content: '✨ Generated Prompt';
            position: absolute;
            top: -10px;
            left: 15px;
            background: white;
            padding: 0 8px;
            font-size: 12px;
            color: #3b82f6;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .cta-section {
            text-align: center;
            margin: 50px 0;
            padding: 40px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 20px;
            border: 1px solid #e2e8f0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white !important;
            padding: 20px 45px;
            text-decoration: none;
            font-weight: 700;
            font-size: 18px;
            margin: 25px 0;
            border-radius: 50px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
            border: none;
            position: relative;
            overflow: hidden;
        }
        .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        .cta-button:hover::before {
            left: 100%;
        }
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }
        .cta-subtext {
            margin-top: 20px;
            color: #475569;
            font-size: 16px;
            font-weight: 600;
        }
        .closing-text {
            font-size: 18px;
            margin: 40px 0;
            color: #475569;
            text-align: center;
            font-weight: 500;
            padding: 25px;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 16px;
            border: 1px solid #f59e0b;
        }
        .footer {
            background: #f8fafc;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            padding: 30px 45px;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 600px) {
            body { padding: 10px; }
            .container { border-radius: 12px; }
            .header { padding: 30px 25px; }
            .content { padding: 30px 25px; }
            .headline { font-size: 26px; }
            .intro-text { font-size: 18px; }
            .simple-box, .example { padding: 25px; }
            .cta-section { padding: 25px; }
            .footer { padding: 25px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="early-access">Early Access</div>
            <div class="logo">Turify</div>
            <div class="tagline">Free AI Prompt Generator</div>
        </div>
        
        <div class="content">
            <h1 class="headline">Get Better Results from ChatGPT, Claude & Other AI Tools</h1>
            
            <p class="intro-text">Struggling to get good results from AI tools? <strong>Turify</strong> writes better prompts for you.</p>
            
            <div class="simple-box">
                <h3>Here's how it works:</h3>
                <p><strong>1.</strong> Tell us what you want to create<br>
                <strong>2.</strong> We generate the perfect prompt<br>
                <strong>3.</strong> Copy & paste into any AI tool</p>
            </div>
            
            <div class="example">
                <div class="example-title">Example:</div>
                <div class="example-content">
                    <p><strong>You want:</strong></p>
                    <div class="example-input">"Project status update to my boss"</div>
                    
                    <p><strong>Turify creates:</strong></p>
                    <div class="example-output"># Identity

You are a professional writer. Create a project status update to my boss using the provided variables.

# Instructions

* Use clear, professional language appropriate for context
* Structure content logically with proper formatting
* Include specific details and actionable information
* Adapt content for Australia locale, including appropriate cultural context, business practices, and communication style

# Task

Write engaging content about {{topic}} for {{target_audience}} optimized for {{main_keyword}}. Include clear structure and actionable insights.</div>
                </div>
            </div>
            
            <p class="closing-text">
                🚀 Works with ChatGPT, Claude, Midjourney, and any other AI tool. Get better results in seconds.
            </p>
            
            <div class="cta-section">
                <a href="https://turify.dev/signup?utm_source=email&utm_campaign=early_access" class="cta-button">
                    Try Turify Free
                </a>
                <p class="cta-subtext">
                    <strong>💯 100% Free during early release</strong>
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Questions?</strong> Visit <a href="https://turify.dev">turify.dev</a></p>
            <p style="margin-top: 15px; font-size: 12px;">
                <a href="${unsubscribeUrl}">Unsubscribe</a> from early access emails
            </p>
        </div>
    </div>
</body>
</html>`;
};

// Function to read emails from text file
async function readEmailsFromFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    // Split by lines and filter out empty lines
    const emails = data
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    return emails;
  } catch (error) {
    console.error('Error reading emails file:', error);
    throw error;
  }
}

// Function to check for unsubscribed emails
async function getUnsubscribedEmails(emails) {
  try {
    const unsubscribed = await prisma.emailUnsubscribe.findMany({
      where: {
        email: {
          in: emails
        },
        campaignType: 'early_access'
      },
      select: {
        email: true
      }
    });
    
    return unsubscribed.map(record => record.email);
  } catch (error) {
    console.error('Error checking unsubscribed emails:', error);
    return []; // Return empty array on error to avoid blocking the campaign
  }
}

// Function to filter out unsubscribed emails
async function filterUnsubscribedEmails(emails) {
  const unsubscribedEmails = await getUnsubscribedEmails(emails);
  const filteredEmails = emails.filter(email => !unsubscribedEmails.includes(email));
  
  if (unsubscribedEmails.length > 0) {
    console.log(`📋 Found ${unsubscribedEmails.length} unsubscribed email(s):`);
    unsubscribedEmails.forEach(email => {
      console.log(`  - ${email}`);
    });
    console.log(`✅ Filtered out unsubscribed emails. Proceeding with ${filteredEmails.length} emails.\n`);
  }
  
  return {
    filteredEmails,
    unsubscribedCount: unsubscribedEmails.length,
    unsubscribedEmails
  };
}

// Function to send email to a single recipient
async function sendEmail(recipientEmail) {
  const fromEmail = process.env.EMAIL_FROM_WELCOME || process.env.EMAIL_SERVER_USER;
  const unsubscribeUrl = generateUnsubscribeUrl(recipientEmail);
  
  const mailOptions = {
    from: `"Turify Team" <${fromEmail}>`,
    to: recipientEmail,
    subject: '🚀 Early Access: Free AI Prompt Generator - Turify',
    html: createEmailHTML(recipientEmail),
    text: `EARLY ACCESS

Hi there!

Struggling to get good results from AI tools? Turify writes better prompts for you.

Here's how it works:
1. Tell us what you want to create
2. We generate the perfect prompt  
3. Copy & paste into any AI tool

Example:
You want: "Project status update to my boss"

Turify creates: 
"# Identity

You are a professional writer. Create a project status update to my boss using the provided variables.

# Instructions

* Use clear, professional language appropriate for context
* Structure content logically with proper formatting
* Include specific details and actionable information
* Adapt content for Australia locale, including appropriate cultural context, business practices, and communication style

# Task

Write engaging content about {{topic}} for {{target_audience}} optimized for {{main_keyword}}. Include clear structure and actionable insights."

Works with ChatGPT, Claude, Midjourney, and any other AI tool. Get better results in seconds.

100% Free during early release

Try Turify Free: https://turify.dev/signup?utm_source=email&utm_campaign=early_access

Questions? Visit turify.dev

Unsubscribe from early access emails: ${unsubscribeUrl}

Best regards,
The Turify Team`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${recipientEmail}`);
    console.log(`Message ID: ${info.messageId}`);
    return { success: true, email: recipientEmail, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${recipientEmail}:`, error.message);
    return { success: false, email: recipientEmail, error: error.message };
  }
}

// Main function to process all emails
async function processEmails() {
  console.log('🚀 Starting Turify email campaign...\n');

  // Check if required environment variables are set
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.error('❌ Error: EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD environment variables are required');
    console.log('Please set these in your .env file:');
    console.log('EMAIL_SERVER_USER=your-aws-ses-user');
    console.log('EMAIL_SERVER_PASSWORD=your-aws-ses-password');
    console.log('EMAIL_FROM_WELCOME=your-verified-sender@domain.com (optional, defaults to EMAIL_SERVER_USER)');
    console.log('UNSUBSCRIBE_SECRET=your-secret-for-unsubscribe-tokens (optional, but recommended)');
    process.exit(1);
  }

  const emailsFilePath = path.join(__dirname, 'emails.txt');
  
  try {
    // Read emails from file
    console.log(`📖 Reading emails from: ${emailsFilePath}`);
    const allEmails = await readEmailsFromFile(emailsFilePath);
    
    if (allEmails.length === 0) {
      console.log('❌ No valid emails found in the file');
      return;
    }

    console.log(`📧 Found ${allEmails.length} email(s) in file`);

    // Filter out unsubscribed emails
    console.log('🔍 Checking for unsubscribed emails...');
    const { filteredEmails, unsubscribedCount, unsubscribedEmails } = await filterUnsubscribedEmails(allEmails);
    
    if (filteredEmails.length === 0) {
      console.log('❌ No emails to send after filtering unsubscribed addresses');
      return;
    }

    // Verify SMTP connection
    console.log('🔗 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified\n');

    const results = [];
    
    // Send emails with a delay to avoid rate limiting
    for (let i = 0; i < filteredEmails.length; i++) {
      const email = filteredEmails[i];
      console.log(`📤 Sending email ${i + 1}/${filteredEmails.length} to: ${email}`);
      
      const result = await sendEmail(email);
      results.push(result);
      
      // Add delay between emails (2 seconds)
      if (i < filteredEmails.length - 1) {
        console.log('⏳ Waiting 2 seconds before next email...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n📊 Campaign Summary:');
    console.log(`📧 Total emails in file: ${allEmails.length}`);
    console.log(`🚫 Unsubscribed (skipped): ${unsubscribedCount}`);
    console.log(`📤 Attempted to send: ${filteredEmails.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    if (unsubscribedCount > 0) {
      console.log('\n🚫 Unsubscribed emails (skipped):');
      unsubscribedEmails.forEach(email => {
        console.log(`  - ${email}`);
      });
    }

    if (failed > 0) {
      console.log('\n❌ Failed emails:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.email}: ${r.error}`);
      });
    }

    // Close Prisma connection
    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error processing emails:', error);
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  processEmails();
}

module.exports = { processEmails, sendEmail, readEmailsFromFile }; 