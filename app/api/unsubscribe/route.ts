import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET method for direct unsubscribe links from emails
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const campaignType = searchParams.get('campaign') || 'early_access';
    const token = searchParams.get('token');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Simple token validation (in production, use proper JWT or signed tokens)
    const expectedToken = Buffer.from(email + process.env.UNSUBSCRIBE_SECRET).toString('base64');
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 400 }
      );
    }

    // Check if already unsubscribed
    const existingUnsubscribe = await prisma.emailUnsubscribe.findUnique({
      where: { email }
    });

    if (existingUnsubscribe) {
      // Return success page even if already unsubscribed
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Already Unsubscribed - Turify</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; background: #f8fafc; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
            .logo { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 20px; }
            h1 { color: #1e293b; margin-bottom: 16px; }
            p { color: #64748b; line-height: 1.6; margin-bottom: 20px; }
            .success { color: #059669; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Turify</div>
            <h1>Already Unsubscribed</h1>
            <p class="success">✓ You're already unsubscribed from our ${campaignType} emails.</p>
            <p>You won't receive any more emails from this campaign.</p>
            <p><a href="https://turify.dev" style="color: #3b82f6;">← Back to Turify</a></p>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Add to unsubscribe list
    await prisma.emailUnsubscribe.create({
      data: {
        email,
        campaignType,
        reason: 'Unsubscribed via email link'
      }
    });

    // Return success page
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Successfully Unsubscribed - Turify</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; background: #f8fafc; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
          .logo { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 20px; }
          h1 { color: #1e293b; margin-bottom: 16px; }
          p { color: #64748b; line-height: 1.6; margin-bottom: 20px; }
          .success { color: #059669; font-weight: 600; }
          .feedback { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feedback textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-family: inherit; resize: vertical; }
          .feedback button { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Turify</div>
          <h1>Successfully Unsubscribed</h1>
          <p class="success">✓ You've been unsubscribed from our ${campaignType} emails.</p>
          <p>We're sorry to see you go! You won't receive any more emails from this campaign.</p>
          
          <div class="feedback">
            <p><strong>Help us improve:</strong> Why did you unsubscribe? (optional)</p>
            <form action="/api/unsubscribe/feedback" method="POST">
              <input type="hidden" name="email" value="${email}">
              <textarea name="reason" placeholder="Your feedback helps us improve our emails..." rows="3"></textarea>
              <br><button type="submit">Send Feedback</button>
            </form>
          </div>
          
          <p><a href="https://turify.dev" style="color: #3b82f6;">← Back to Turify</a></p>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}

// POST method for form-based unsubscribes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, campaignType = 'early_access', reason } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if already unsubscribed
    const existingUnsubscribe = await prisma.emailUnsubscribe.findUnique({
      where: { email }
    });

    if (existingUnsubscribe) {
      return NextResponse.json(
        { message: 'Email already unsubscribed', alreadyUnsubscribed: true },
        { status: 200 }
      );
    }

    // Add to unsubscribe list
    await prisma.emailUnsubscribe.create({
      data: {
        email,
        campaignType,
        reason: reason || 'Unsubscribed via form'
      }
    });

    return NextResponse.json(
      { message: 'Successfully unsubscribed', success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unsubscribe POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
} 