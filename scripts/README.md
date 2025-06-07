# Turify Email Campaign Scripts

This folder contains scripts for sending promotional emails about Turify.

## Files

- `send-turify-emails.js` - Main script for sending promotional emails
- `emails.txt` - Text file containing email addresses (one per line)
- `README.md` - This documentation file

## Setup

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Email configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### 2. Gmail Setup (if using Gmail)

If you're using Gmail, you'll need to:

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `EMAIL_PASS` in your `.env` file

### 3. Email List

Edit the `emails.txt` file to include the email addresses you want to send to:

```
recipient1@example.com
recipient2@gmail.com
recipient3@company.com
```

- One email per line
- Empty lines are ignored
- Invalid emails (without @) are filtered out

## Usage

### Run the Email Campaign

```bash
node scripts/send-turify-emails.js
```

### Features

- **HTML Email Template**: Beautiful, responsive HTML email with Turify branding
- **Plain Text Fallback**: Includes a plain text version for email clients that don't support HTML
- **Rate Limiting**: 2-second delay between emails to avoid spam filters
- **Error Handling**: Continues sending even if some emails fail
- **Progress Tracking**: Shows progress and summary of successful/failed sends
- **SMTP Verification**: Verifies connection before sending emails

### Email Template

The email includes:
- Professional Turify branding
- Feature highlights with icons
- Call-to-action button
- Special launch offer
- Responsive design for mobile and desktop
- Unsubscribe link placeholder

### Customization

You can customize the email by editing the `createEmailHTML()` function in `send-turify-emails.js`:

- Update the content and messaging
- Modify the styling and colors
- Change the call-to-action URL
- Add or remove features

### Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of your main email password
- Consider using a dedicated email service for bulk sending
- Test with a small list first

### Troubleshooting

**"Authentication failed" error:**
- Check your email credentials in `.env`
- For Gmail, ensure you're using an App Password, not your regular password
- Verify 2FA is enabled on your Google account

**"Connection timeout" error:**
- Check your internet connection
- Verify the SMTP host and port settings
- Some networks block SMTP ports

**Emails going to spam:**
- Use a verified sender domain
- Include an unsubscribe link
- Don't send too many emails at once
- Consider using a professional email service like SendGrid or Mailgun for large campaigns 