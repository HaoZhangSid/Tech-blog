/**
 * Email Sender Utility
 * 
 * Handles sending emails for password reset functionality
 */

const nodemailer = require('nodemailer');

// Create reusable transporter using environment variables
const createTransporter = () => {
  // Gmail specific configuration 
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // 允许自签名证书
    }
  });
};

// For testing purposes, create a test account with Ethereal
const createTestTransporter = async () => {
  // Generate a test account at Ethereal for testing
  const testAccount = await nodemailer.createTestAccount();
  console.log('Test email account created:', testAccount.user);
  
  // Create a test transporter
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 * @returns {Promise} - Resolves when email is sent
 */
exports.sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    // Use test transport in dev environment only if EMAIL_PASS is missing
    const useTestAccount = process.env.NODE_ENV !== 'production' && !process.env.EMAIL_PASS;
    
    let transporter;
    let previewUrl;
    
    if (useTestAccount) {
      transporter = await createTestTransporter();
    } else {
      transporter = createTransporter();
    }
    
    // Reset link URL
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    // Email options
    const mailOptions = {
      from: `"Tech Blog" <${useTestAccount ? transporter.options.auth.user : process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; color: #06b6d4;">Tech Blog</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd;">
            <h2>Password Reset Request</h2>
            <p>Hello${userName ? ' ' + userName : ''},</p>
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            
            <p>Alternatively, you can copy and paste the following link into your browser:</p>
            <p style="background-color: #eee; padding: 10px; word-break: break-all;">${resetUrl}</p>
            
            <p>This link will expire in 1 hour for security reasons.</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Regards,<br>The Tech Blog Team</p>
          </div>
          
          <div style="padding: 15px; text-align: center; font-size: 12px; color: #666; background-color: #f1f1f1;">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    
    // If using test account, log the preview URL
    if (useTestAccount && info.messageId) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL: %s', previewUrl);
    }
    
    return { info, previewUrl };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Test email configuration
 * Used to verify email settings without sending actual emails
 */
exports.testEmailConfig = async () => {
  try {
    // First try with configured transport
    const transporter = createTransporter();
    const verified = await transporter.verify();
    return {
      success: true,
      message: 'Email configuration is valid'
    };
  } catch (error) {
    console.error('Email configuration error:', error.message);
    
    // If configured transport failed, try with test account
    try {
      const testTransporter = await createTestTransporter();
      return {
        success: true,
        message: 'Using Ethereal test account for emails',
        testAccount: testTransporter.options.auth.user
      };
    } catch (testError) {
      return {
        success: false,
        message: 'All email configurations failed',
        error: error.message,
        testError: testError.message
      };
    }
  }
};

// Exports for direct testing
exports.sendTestEmail = async (toEmail) => {
  try {
    // Show current email configuration
    console.log('Current Email Configuration:');
    console.log('- HOST:', process.env.EMAIL_HOST);
    console.log('- PORT:', process.env.EMAIL_PORT);
    console.log('- USER:', process.env.EMAIL_USER);
    console.log('- FROM:', process.env.EMAIL_FROM);
    console.log('- TEST MODE:', process.env.USE_TEST_EMAIL);
    
    // Create transporter
    const transporter = createTransporter();
    
    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('✅ SMTP server connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP server connection failed:', verifyError.message);
      throw verifyError;
    }
    
    // Send a test email
    const mailOptions = {
      from: `"Tech Blog Test" <${process.env.EMAIL_FROM}>`,
      to: toEmail,
      subject: 'Test Email from Tech Blog',
      text: 'If you received this email, it means the email configuration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #06b6d4;">Email Test Successful!</h1>
          <p>If you received this email, it means the email configuration is working correctly.</p>
          <p>Configuration details:</p>
          <ul>
            <li>SMTP Host: ${process.env.EMAIL_HOST}</li>
            <li>SMTP User: ${process.env.EMAIL_USER}</li>
            <li>From Address: ${process.env.EMAIL_FROM}</li>
            <li>Test Mode: ${process.env.USE_TEST_EMAIL}</li>
            <li>Time Sent: ${new Date().toLocaleString()}</li>
          </ul>
          <p>You can now confidently use the password reset functionality.</p>
        </div>
      `
    };
    
    console.log('Attempting to send test email to:', toEmail);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully');
    console.log('- Message ID:', info.messageId);
    console.log('- Response:', info.response);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Failed to send test email');
    console.error('- Error code:', error.code);
    console.error('- Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('- Authentication error. Please check your Gmail App Password.');
      console.error('- Make sure 2FA is enabled and you\'re using an App Password, not your regular password.');
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      troubleshooting: `
        Common issues:
        1. For Gmail: Make sure you've created an App Password and 2FA is enabled
        2. Double-check that you're using the correct App Password (no spaces)
        3. Verify that your Gmail account doesn't have additional security restrictions
      `
    };
  }
} 