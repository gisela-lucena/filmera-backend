import nodemailer from "nodemailer";

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 10000);
const RESEND_API_URL = "https://api.resend.com/emails";

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const sendPasswordResetEmail = async ({ email, resetToken }) => {
  const frontendUrl = process.env.FRONTEND_URL || "https://filmera.us";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = "Reset your FILMERA password";
  const text = [
    "We received a request to reset your FILMERA password.",
    "",
    `Open this link to create a new password: ${resetUrl}`,
    "",
    "This link expires in 1 hour. If you did not request this, you can ignore this email.",
  ].join("\n");
  const html = `
    <p>We received a request to reset your FILMERA password.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
  `;

  if (process.env.RESEND_API_KEY) {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(
        errorBody.message || `Resend email failed with status ${response.status}`,
      );
      error.statusCode = response.status;
      error.code = errorBody.name || "RESEND_API_ERROR";
      throw error;
    }

    return response.json();
  }

  await createTransporter().sendMail({
    from,
    to: email,
    subject,
    text,
    html,
  });
};
