import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const reason = formData.get('reason') as string;

    if (!email) {
      return new NextResponse('Email is required', { status: 400 });
    }

    // Update the existing unsubscribe record with the feedback
    if (reason && reason.trim()) {
      await prisma.emailUnsubscribe.updateMany({
        where: { email },
        data: { reason: reason.trim() }
      });
    }

    // Return a simple success page
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Thank You - Turify</title>
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
          <h1>Thank You!</h1>
          <p class="success">✓ Your feedback has been received.</p>
          <p>We appreciate you taking the time to help us improve our emails.</p>
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
    console.error('Feedback error:', error);
    return new NextResponse('Failed to process feedback', { status: 500 });
  }
} 