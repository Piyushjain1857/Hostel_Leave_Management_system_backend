const getBaseTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fb; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 30px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
    .content { padding: 40px; color: #334155; line-height: 1.6; }
    .content h2 { color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 20px; }
    .highlight-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0; }
    .highlight-box p { margin: 8px 0; font-size: 15px; }
    .highlight-box strong { color: #0f172a; }
    .otp-code { display: block; width: fit-content; margin: 24px auto; padding: 16px 32px; background-color: #eff6ff; color: #1d4ed8; font-size: 32px; font-weight: 700; letter-spacing: 4px; border-radius: 8px; border: 2px dashed #bfdbfe; }
    .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 0; color: #64748b; font-size: 13px; }
    .button { display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hostel Leave Management</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${bodyContent}
    </div>
    <div class="footer">
      <p>This is an automated message from the Hostel Leave Management System.</p>
      <p>If you didn't request this action, please contact administration immediately.</p>
    </div>
  </div>
</body>
</html>
`;

const getLoginAlertTemplate = (name, role, loginTime, ip, userAgent) => {
  return getBaseTemplate(
    'New Login Detected',
    `
    <p>Hello ${name},</p>
    <p>We noticed a new login to your Hostel Leave Management System account.</p>
    <div class="highlight-box">
      <p><strong>Account Role:</strong> <span style="text-transform: capitalize;">${role}</span></p>
      <p><strong>Date & Time:</strong> ${loginTime}</p>
      <p><strong>IP Address:</strong> ${ip}</p>
      <p><strong>Device/Browser:</strong> ${userAgent}</p>
    </div>
    <p>If this was you, you can safely ignore this email.</p>
    <p>If you don't recognize this activity, please <strong>change your password immediately</strong> to secure your account.</p>
    `
  );
};

const getOtpTemplate = (title, message, otp) => {
  return getBaseTemplate(
    title,
    `
    <p>${message}</p>
    <p>Please use the following OTP to complete your request. This code will expire in 10 minutes.</p>
    <div class="otp-code">${otp}</div>
    <p>Do not share this code with anyone.</p>
    `
  );
};

const getPasswordChangedTemplate = (name = "User") => {
  return getBaseTemplate(
    'Security Alert: Password Changed',
    `
    <p>Hello ${name},</p>
    <p>Your password for the Hostel Leave Management System was successfully updated.</p>
    <div class="highlight-box">
      <p>If you made this change, no further action is required.</p>
    </div>
    <p>If you did not authorize this change, please contact your hostel administration immediately to secure your account.</p>
    `
  );
};

const getLeaveStatusTemplate = (name, status, details = "") => {
  const isApproved = status.toLowerCase() === 'approved';
  const statusColor = isApproved ? '#16a34a' : '#dc2626';
  
  return getBaseTemplate(
    `Leave Request ${status}`,
    `
    <p>Hello ${name},</p>
    <p>Your recent leave request has been reviewed.</p>
    <div class="highlight-box">
      <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 700; text-transform: uppercase;">${status}</span></p>
      ${details ? `<p><strong>Details:</strong> ${details}</p>` : ''}
    </div>
    <p>You can view the full details of this request in your Student Dashboard.</p>
    `
  );
};

const getLeaveRequestTemplate = (parentName, studentName, reason) => {
  return getBaseTemplate(
    'Action Required: New Leave Request',
    `
    <p>Hello ${parentName},</p>
    <p>Your ward, <strong>${studentName}</strong>, has submitted a new leave request that requires your approval.</p>
    <div class="highlight-box">
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Reason:</strong> ${reason}</p>
    </div>
    <p>Please log in to your Parent Dashboard to review and approve or reject this request.</p>
    `
  );
};

module.exports = {
  getLoginAlertTemplate,
  getOtpTemplate,
  getPasswordChangedTemplate,
  getLeaveStatusTemplate,
  getLeaveRequestTemplate
};
