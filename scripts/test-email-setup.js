const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailSetup() {
  console.log('🧪 Testing Turify email setup...\n');

  // Check environment variables
  console.log('📋 Checking environment variables:');
  const requiredVars = ['EMAIL_SERVER_USER', 'EMAIL_SERVER_PASSWORD'];
  const optionalVars = ['EMAIL_SERVER_HOST', 'EMAIL_SERVER_PORT'];
  
  let allGood = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allGood = false;
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: ${process.env[varName]}`);
    } else {
      console.log(`⚠️  ${varName}: Using default`);
    }
  });

  if (!allGood) {
    console.log('\n❌ Missing required environment variables. Please check your .env file.');
    return;
  }

  // Test SMTP connection
  console.log('\n🔗 Testing SMTP connection...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_SERVER_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    console.log('🎉 Your email setup is ready for the Turify campaign!');
  } catch (error) {
    console.log('❌ SMTP connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   - For AWS SES, make sure your credentials are correct');
    console.log('   - Verify your AWS SES domain/email is verified');
    console.log('   - Check that EMAIL_SERVER_HOST and EMAIL_SERVER_PORT are correct');
  }
}

testEmailSetup(); 