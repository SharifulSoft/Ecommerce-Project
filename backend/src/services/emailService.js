const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim(),
    pass: (process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '').trim(),
  },
  logger: true,
  debug: true,
});

/**
 * Send password reset email with token and PIN
 * @param {string} email - User email
 * @param {string} firstName - User first name
 * @param {string} resetToken - Reset token
 * @param {string} resetPin - Reset PIN code
 * @param {string} frontendUrl - Frontend URL for reset link
 */
const sendPasswordResetEmail = async (email, firstName, resetToken, resetPin, frontendUrl) => {
  try {
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    const htmlContent = `
     <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Email</title>
          <style>
              /* Base style */
              body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  background: #f0f0f0;
              }

              .email {
                  max-width: 550px;
                  margin: 20px auto;
                  background: white;
                  border-radius: 8px;
                  overflow: hidden;
              }

              .header {
                  background: #8b5cf6;
                  padding: 20px;
                  text-align: center;
              }

              .logo {
                  color: white;
                  font-size: 24px;
                  font-weight: bold;
              }

              .body {
                  padding: 30px;
              }

              .body p {
                  color: #666;
                  font-size: 14px;
                  line-height: 1.6;
                  margin: 0 0 20px 0;
              }

              .body p:first-child {
                  color: #333;
                  font-weight: 500;
              }

              .btn {
                  display: block;
                  background: #8b5cf6;
                  color: white;
                  padding: 12px;
                  text-align: center;
                  text-decoration: none;
                  border-radius: 6px;
                  font-size: 14px;
                  margin: 20px 0;
              }

              .pin-box {
                  background: #f5f3ff;
                  border: 2px dashed #8b5cf6;
                  padding: 15px;
                  border-radius: 8px;
                  text-align: center;
                  margin: 20px 0;
              }

              .pin-label {
                  color: #7c3aed;
                  font-size: 12px;
                  margin-bottom: 8px;
              }

              .pin-code {
                  font-size: 24px;
                  font-weight: bold;
                  color: #7c3aed;
                  letter-spacing: 5px;
              }

              .footer {
                  background: #faf5ff;
                  padding: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #666;
              }

              .footer p {
                  margin: 0 0 5px 0;
              }

              /* Responsive */
              @media only screen and (max-width: 600px) {
                  .email {
                      margin: 10px;
                  }
                  .body {
                      padding: 20px;
                  }
                  .pin-code {
                      font-size: 20px;
                      letter-spacing: 3px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email">
              <div class="header">
                  <div class="logo">Password Reset Request</div>
              </div>

              <div class="body">
                  <p>Hi ${firstName},</p>
                  <p>We received a request to reset your password. You can reset your password using either the link below or the PIN code provided.</p>

                  <a href="${resetLink}" class="btn">Reset Password</a>

                  <div class="pin-box">
                      <div class="pin-label">YOUR PIN CODE</div>
                      <div class="pin-code">${resetPin}</div>
                  </div>

                  <p style="font-size: 12px; color: #999;">Code is valid for 5 minutes.</p>
              </div>

              <div class="footer">
                  <p><strong>QuickShop</strong></p>
                  <p>123 Business St, City | © 2025 QuickShop</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Valid for 5 Minutes',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

module.exports = {
  sendPasswordResetEmail,
};

