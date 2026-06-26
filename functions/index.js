const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const path = require("path");

admin.initializeApp();
const db = admin.firestore();

// Helper to get SMTP transporter
async function getTransporter(settings) {
  const user = settings.smtpUser;
  const pass = settings.smtpPass;
  let host = settings.smtpHost;
  let port = settings.smtpPort || "587";
  let secure = settings.smtpSecure === true;

  // Auto-detect common email providers if host is empty
  if (!host && user) {
    if (user.endsWith('@gmail.com')) {
      host = 'smtp.gmail.com';
      port = '587';
      secure = false;
    } else if (user.endsWith('@outlook.com') || user.endsWith('@hotmail.com')) {
      host = 'smtp-mail.outlook.com';
      port = '587';
      secure = false;
    }
  }

  if (host && user && pass) {
    return nodemailer.createTransport({
      host: host,
      port: parseInt(port),
      secure: secure,
      auth: { user, pass }
    });
  }
  return null;
}

// 1. Cloud Function triggered automatically when a new user is created in Firestore
exports.sendWelcomeEmail = onDocumentCreated("users/{userId}", async (event) => {
  const userData = event.data.data();
  if (!userData || !userData.email) return;

  try {
    // Load SMTP settings from Firestore settings/system
    const settingsDoc = await db.collection("settings").doc("system").get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};

    const transporter = await getTransporter(settings);
    if (!transporter) {
      console.log("No SMTP settings configured. Welcome email skipped.");
      return;
    }

    const defaultSender = settings.smtpUser ? `"Constructables Team" <${settings.smtpUser}>` : '"Constructables Team" <noreply@constructables.com>';
    const sender = settings.senderEmail || defaultSender;

    // Google-style clean HTML welcome template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Constructables</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 24px;
            color: #1f2937;
          }
          .card {
            max-width: 440px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            padding: 32px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }
          .logo-container {
            text-align: center;
            margin-bottom: 24px;
          }
          .logo {
            height: 65px;
          }
          h1 {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 16px 0;
            text-align: center;
          }
          p {
            font-size: 13px;
            line-height: 1.5;
            color: #4b5563;
            margin: 0 0 20px 0;
          }
          .details-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 20px;
          }
          .details-row {
            display: flex;
            margin-bottom: 8px;
            font-size: 12px;
          }
          .details-row:last-child {
            margin-bottom: 0;
          }
          .label {
            font-weight: 600;
            color: #6b7280;
            width: 80px;
            flex-shrink: 0;
          }
          .value {
            color: #111827;
            word-break: break-all;
          }
          .btn-container {
            text-align: center;
            margin: 20px 0;
          }
          .btn {
            background-color: #f97316;
            color: #ffffff !important;
            text-decoration: none;
            padding: 10px 24px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 6px;
            display: inline-block;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            margin-top: 24px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo-container">
            <img src="cid:constructables-logo" alt="Constructables Logo" class="logo" />
          </div>
          <h1>Welcome to Constructables!</h1>
          <p>Your administrator has set up a new account for you on the workspace manager dashboard.</p>
          
          <div class="details-box">
            <div class="details-row">
              <span class="label">Name:</span>
              <span class="value">${userData.name}</span>
            </div>
            <div class="details-row">
              <span class="label">Email:</span>
              <span class="value">${userData.email}</span>
            </div>
            ${userData.tempPassword ? `
            <div class="details-row">
              <span class="label">Password:</span>
              <span class="value">${userData.tempPassword}</span>
            </div>
            ` : ''}
          </div>

          <p style="text-align: center; margin-bottom: 12px; font-size: 13px;">Click below to access your account:</p>
          <div class="btn-container">
            <a href="https://constructables-app.pages.dev/login" class="btn" target="_blank">Access Account Dashboard</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 Constructables Inc. All rights reserved.<br>
          This is an automated system email. Please do not reply directly.
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: sender,
      to: userData.email,
      subject: 'Welcome to Constructables! Your Account Details',
      html: htmlContent,
      attachments: [{
        filename: 'logo-bg.png',
        path: path.join(__dirname, 'logo-bg.png'),
        cid: 'constructables-logo'
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email successfully sent to ${userData.email}`);

    // Delete tempPassword field from Firestore for security
    if (userData.tempPassword) {
      await db.collection("users").doc(event.params.userId).update({
        tempPassword: admin.firestore.FieldValue.delete()
      });
      console.log(`Successfully cleaned up temporary password for user ${event.params.userId}`);
    }
  } catch (error) {
    console.error("Error sending welcome email in trigger:", error);
  }
});

// 2. HTTPS Callable endpoint to test SMTP settings
exports.testSmtp = onCall(async (request) => {
  const { smtpUser, smtpPass, testRecipient } = request.data;
  if (!testRecipient) {
    throw new HttpsError("invalid-argument", "Test recipient email is required.");
  }

  try {
    const settingsDoc = await db.collection("settings").doc("system").get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};

    const user = smtpUser || settings.smtpUser;
    const pass = smtpPass || settings.smtpPass;
    let host = settings.smtpHost;
    let port = settings.smtpPort || "587";
    let secure = settings.smtpSecure === true;

    if (!host && user) {
      if (user.endsWith("@gmail.com")) {
        host = "smtp.gmail.com";
        port = "587";
        secure = false;
      } else if (user.endsWith("@outlook.com") || user.endsWith("@hotmail.com")) {
        host = "smtp-mail.outlook.com";
        port = "587";
        secure = false;
      }
    }

    if (!host || !user || !pass) {
      throw new HttpsError("failed-precondition", "SMTP credentials not configured.");
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure,
      auth: { user, pass }
    });

    const mailOptions = {
      from: user,
      to: testRecipient,
      subject: "Constructables - SMTP Connection Test",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 440px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 28px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); color: #1f2937;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:constructables-logo" alt="Constructables Logo" style="height: 55px;" />
          </div>
          <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 12px 0; text-align: center;">Connection Verified</h2>
          <p style="font-size: 13px; line-height: 1.5; color: #4b5563; margin: 0 0 20px 0; text-align: center;">Your dynamic SMTP connection is working correctly.</p>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; font-size: 12px; line-height: 1.6; color: #4b5563;">
            <div style="margin-bottom: 6px;"><strong>SMTP Host:</strong> ${host}</div>
            <div style="margin-bottom: 6px;"><strong>SMTP Port:</strong> ${port}</div>
            <div style="margin-bottom: 6px;"><strong>User:</strong> ${user}</div>
            <div><strong>SSL/TLS:</strong> ${secure ? 'Yes' : 'No'}</div>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'logo-bg.png',
        path: path.join(__dirname, 'logo-bg.png'),
        cid: 'constructables-logo'
      }]
    };

    await transporter.sendMail(mailOptions);
    return { message: "Test email sent successfully! Connection verified." };
  } catch (error) {
    console.error("Test SMTP error:", error);
    throw new HttpsError("internal", error.message);
  }
});
