import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const sendPasswordResetEmail = async ({ email, resetToken }) => {
  const frontendUrl = process.env.FRONTEND_URL || "https://filmera.us";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await createTransporter().sendMail({
    from,
    to: email,
    subject: "Reset your FILMERA password",
    text: [
      "We received a request to reset your FILMERA password.",
      "",
      `Open this link to create a new password: ${resetUrl}`,
      "",
      "This link expires in 1 hour. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>We received a request to reset your FILMERA password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  });
};
